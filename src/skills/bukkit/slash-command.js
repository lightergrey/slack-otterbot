const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    try {
      if (message.command === "/bukkit") {
        bot.replyAcknowledge();

        const [, query, source] = message.text.match(
          /^([\w-]+)?(?: from (\w+))?$/
        );

        const reply = await bukkitService.find(controller, query, source);

        bot.reply(message, reply);
      }
    } catch (err) {
      bot.replyPrivateDelayed(message, `Error getting bukkit: ${err}`);
    }
  });
};
