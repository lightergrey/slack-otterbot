const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.hears(
    [/^bukkit\s?([\w-]+)?(?: from (\w+))?$/i],
    "direct_message, direct_mention, ambient",
    async (bot, message) => {
      try {
        const [, query, source] = message.match;
        const reply = await bukkitService.find(controller, query, source);

        bot.reply(message, reply);
      } catch (err) {
        bot.reply(message, `Error getting bukkit: ${err}`);
      }
    }
  );
};
