const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.hears(
    [/^bukkit\s?([\w-]+)?(?: from (\w+))?$/i],
    "direct_message, direct_mention, ambient",
    async (bot, message) => {
      console.log(`*** message: ${JSON.stringify(message)}`);
      try {
        const [, query, source] = message.match;
        const reply = await bukkitService.find(controller, query, source);
        console.log(`*** reply: ${reply}`);
        bot.reply(message, reply);
      } catch (err) {
        bot.reply(message, `Error getting bukkit: ${err}`);
      }
    }
  );
};
