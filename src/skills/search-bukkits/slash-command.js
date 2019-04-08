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

  controller.on("interactive_message_callback", (bot, message) => {
    console.log("========= INTERACTIVE MESSAGE CALLBACK");
    console.log(JSON.stringify(message));
    console.log("///////// INTERACTIVE MESSAGE CALLBACK");
    bot.replyPrivate(message, "interactive_message_callback");
  });

  controller.on("block_actions", (bot, message) => {
    console.log("========= BLOCK ACTIONS");
    console.log(JSON.stringify(message));
    console.log("///////// BLOCK ACTIONS");
    bot.replyPrivate(message, "block_actions");
  });

  controller.hears("interactive", "direct_message", (bot, message) => {
    console.log("========= INTERACTIVE");
    console.log(JSON.stringify(message));
    console.log("///////// INTERACTIVE");
    bot.replyPrivate(message, "interactive");
  });
};
