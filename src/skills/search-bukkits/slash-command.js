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
      bot.replyInteractive(message, { blocks });
    } catch (err) {
      bot.replyPrivate(message, `'/search-bukkits' error: ${err}`);
    }
  });

  controller.on("interactive_message_callback", (bot, message) => {
    bot.replyPrivate(message, JSON.stringify(message, null, 2));
  });

  controller.on("block_actions", (bot, message) => {
    bot.replyPrivate(message, JSON.stringify(message, null, 2));
  });

  controller.hears("interactive", "direct_message", (bot, message) => {
    bot.replyPrivate(message, JSON.stringify(message, null, 2));
  });
};
