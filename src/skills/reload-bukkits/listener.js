/**
 * • `@bot reload bukkits` Gets all the bukkits from the bukkitSources
 */

const getBukkitsFromSources = require("../../utils/get-bukkits-from-sources");
const getReply = require("../../utils/get-reply");
const getDataFromStorage = require("../../utils/get-data-from-storage");

module.exports = controller => {
  controller.hears(
    ["^reload bukkits"],
    "direct_message,direct_mention,mention",
    async (bot, message) => {
      const reply = getReply(bot, message);

      try {
        const data = await getDataFromStorage(controller, "bukkitSources");
        const sources =
          data && data.values ? data.values : ["https://bukk.it/"];
        const bukkits = getBukkitsFromSources(sources).then(values => {
          controller.storage.teams.save(
            { id: "bukkits", values: values },
            requestErr => {
              if (requestErr) {
                reply(`Something went wrong: ${requestErr}`);
                return;
              }

              reply(`${data.length} bukkits loaded.`);
            }
          );
        });
      } catch (err) {
        reply(`Error getting bukkitSources: ${err}`);
      }
    }
  );
};
