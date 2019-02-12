const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    try {
      if (message.command === "/reload-bukkits") {
        bot.replyPrivate(message, `reloading bukkits`);

        const confirmationReply = await bukkitService.reload(controller);
        bot.replyPrivateDelayed(message, confirmationReply);
      }
    } catch (err) {
      bot.replyPrivateDelayed(message, `Error in slash_command: ${err}`);
    }
  });
};
