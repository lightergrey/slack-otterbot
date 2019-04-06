const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/search-bukkits") {
      return;
    }

    bot.replyAcknowledge();

    const [, query] = message.text.match(/^([\w-]+)?$/);

    if (!query) {
      bot.replyPrivate(message, `query required`);
    }

    try {
      const blocks = await bukkitService.search(controller, query);
      bot.replyPrivateDelayed(message, JSON.stringify(blocks, null, 2));
    } catch (err) {
      bot.replyPrivate(message, `'/search-bukkits' error: ${err}`);
    }
  });
};
