const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/reload-bukkits") {
      return;
    }

    bot.replyPrivate(message, `reloading bukkits`);

    try {
      const confirmationReply = await bukkitService.reload(controller);
      bot.replyPrivateDelayed(message, confirmationReply);
    } catch (err) {
      bot.replyPrivateDelayed(message, `'/reload-bukkits' error: ${err}`);
    }
  });
};
