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

const getBukkitsFromSources = async () => {
  const sources = ["https://bukk.it/"];
  const config = {
    values: {
      listItem: "a",
      attr: "href"
    }
  };
  const requests = sources.map(source => {
    return scrapeIt(source, config)
      .then(fileNames => {
        return makeBukkitsFromSourceAndFileNames(source, fileNames.data.values);
      })
      .catch(err => {
        console.error(`###### failed early getBukkitsFromSources: ${err}`);
      });
  });

  return Promise.all(requests)
    .then(responses => {
      return [].concat(...responses);
    })
    .catch(err => {
      console.error(`###### failed late getBukkitsFromSources: ${err}`);
    });
};

const find = async (controller, query, source) => {
  try {
    const bukkits = await storage.get(controller, id);

    if (!bukkits || bukkits.length === 0) {
      return "No bukkits. Try `/reload-bukkits`";
    }

    const match = query
      ? findRandomMatchForQuery(bukkits, query, source)
      : getRandomItem(bukkits);

    if (!match) {
      return "Couldn’t find a match.";
    }

    return match.url;
  } catch (err) {
    return `Error getting bukkit: ${err}`;
  }
};

const reload = async controller => {
  try {
    const values = await getBukkitsFromSources();
    storage.save(controller, { id, values });
    return `${values.length} bukkits loaded`;
  } catch (err) {
    return `Error reloading bukkits: ${err}`;
  }
};

module.exports = { find, reload };
