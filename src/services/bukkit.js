const storage = require("./storage");
const fuzzy = require("fuzzy");
const scrapeIt = require("scrape-it");

const id = "bukkits";

const getRandomItem = items => {
  return items[Math.floor(Math.random() * items.length)];
};

const makeBukkitsFromSourceAndFileNames = (source, fileNames) => {
  return fileNames
    .filter(fileName => /\.(gif|jpg|jpeg|png)$/i.test(fileName))
    .map(fileName => {
      const url = `${source}${fileName}`;
      return {
        source,
        fileName,
        url
      };
    });
};

const findRandomMatchForQuery = (bukkits, query, source) => {
  const matches = fuzzy
    .filter(source, bukkits, {
      extract: el => el.source
    })
    .map(el => (el.original ? el.original : el))
    .filter(item =>
      query ? new RegExp(query, "i").test(item.fileName) : true
    );
  return getRandomItem(matches);
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
    return [].concat(...responses);
  });
};

const find = async (controller, query, source) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bukkits = await storage.get(controller, id);

      if (!bukkits || bukkits.length === 0) {
        reject("No bukkits. Try `/reload-bukkits`");
      }

      const match = query
        ? findRandomMatchForQuery(bukkits, query, source)
        : getRandomItem(bukkits);

      if (!match) {
        resolve("Couldn’t find a match.");
      }

      resolve(match.url);
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
      resolve(`${values.length} bukkits loaded`);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { find, reload };
