const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/search-bukkits") {
      return;
    }

    const [, query] = message.text.match(/^([\w-]+)?$/);

    if (!query) {
      bot.replyPrivate(message, `query required`);
    }

    bot.replyPrivate(message, `searching bukkits`);

    try {
      const confirmationReply = await bukkitService.search(controller, query);
      bot.replyPrivateDelayed(message, confirmationReply);
    } catch (err) {
      bot.replyPrivateDelayed(message, `'/search-bukkits' error: ${err}`);
    }
  });
};
