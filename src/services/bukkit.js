const storage = require("./storage");
const fuzzy = require("fuzzy");
const scrapeIt = require("scrape-it");

const id = "bukkits";

const getRandomItem = items => {
  return items[Math.floor(Math.random() * items.length)];
};

const makeBukkitsFromSourceAndFileNames = (source, fileNames) => {
  const bukkits = fileNames
    .filter(name => /\.(gif|jpg|jpeg|png)$/i.test(name))
    .map(name => {
      const url = `${source}${name}`;
      return {
        [name]: {
          source,
          name,
          url
        }
      };
    });

  return { [source]: Object.assign({}, ...bukkits) };
};

const findRandomMatchForQuery = (bukkits, query) => {
  const matches = getMatchesForQuery(bukkits, query);
  return getRandomItem(matches);
};

const getMatchesForQuery = (bukkits, query) => {
  return bukkits.filter(item =>
    query ? new RegExp(query, "i").test(item.name) : true
  );
};

const getBukkitsFromSources = async sources => {
  const config = {
    values: {
      listItem: "a",
      attr: "href"
    }
  };
  const requests = sources.map(source => {
    return scrapeIt(source, config).then(({ data, response }) => {
      if (response.statusCode !== 200) {
        throw `${response.statusCode}: ${source}`;
      }
      if (data.values.length === 0) {
        throw `${source}: no bukkits found`;
      }
      return makeBukkitsFromSourceAndFileNames(source, data.values);
    });
  });

  return Promise.all(requests).then(responses => {
    return { sources: Object.assign({}, ...responses) };
  });
};

const getBukkitCount = bukkits => {
  const sourceBukkits = Object.values(bukkits.sources).map(source =>
    Object.values(source)
  );
  return [].concat(...sourceBukkits).length;
};

const missingBukkits = bukkits => {
  return (
    !bukkits ||
    !bukkits.sources ||
    Object.values(bukkits.sources).length === 0 ||
    getBukkitCount(bukkits) === 0
  );
};

const getSourceBukkits = (bukkits, source) => {
  const sourceBukkits = fuzzy
    .filter(source, Object.keys(bukkits.sources))
    .map(el => (el.original ? el.original : el))
    .map(source => Object.values(bukkits.sources[source]));

  return [].concat(...sourceBukkits);
};

const find = async (controller, query, source) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bukkits = await storage.get(controller, id);

      if (missingBukkits(bukkits)) {
        reject("No bukkits. Try `/reload-bukkits`");
      }

      const sourceBukkits = getSourceBukkits(bukkits, source);

      const match = query
        ? findRandomMatchForQuery(sourceBukkits, query)
        : getRandomItem(sourceBukkits);

      if (!match) {
        reject("Couldn’t find a match.");
      }

      resolve(match);
    } catch (err) {
      reject(err);
    }
  });
};

const reload = async controller => {
  return new Promise(async (resolve, reject) => {
    try {
      const bukkitSources =
        (await storage.get(controller, "bukkitSources")) || [];
      const values = await getBukkitsFromSources([
        "https://bukk.it/",
        ...bukkitSources
      ]);
      await storage.save(controller, { id, values });

      resolve(`${getBukkitCount(values)} bukkits loaded`);
    } catch (err) {
      reject(err);
    }
  });
};

const search = async (controller, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bukkits = await storage.get(controller, id);

      if (missingBukkits(bukkits)) {
        reject("No bukkits. Try `/reload-bukkits`");
      }

      const sourceBukkits = getSourceBukkits(bukkits);

      const matches = getMatchesForQuery(sourceBukkits, query);

      if (matches.length === 0) {
        reject("Couldn’t find a match.");
        return;
      }

      resolve(matches);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { find, reload, search };
