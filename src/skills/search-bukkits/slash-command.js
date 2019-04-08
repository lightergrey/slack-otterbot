const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/search-bukkits") {
      return;
    }

    bot.replyPrivate(message, `searching bukkits`);

    const [, query] = message.text.match(/^([\w-]+)?$/);

    if (!query) {
      bot.replyPrivate(message, `query required`);
    }

    try {
      const blocks = await bukkitService.search(controller, query);
      bot.replyPrivateDelayed(message, { blocks });
    } catch (err) {
      bot.replyPrivateDelayed(message, `'/search-bukkits' error: ${err}`);
    }
  });

  controller.on("block_actions", (bot, message) => {
    bot.replyInteractive(message, message.text);
  });
};
