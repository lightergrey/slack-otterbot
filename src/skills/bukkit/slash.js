module.exports = controller => {
  controller.on("slash_command", function(bot, message) {
    if (message.command === "/bukkit") {
      const query = message.text === "" ? null : message.text;
      bot.replyPrivate(
        message,
        `Looking for a bukkit that matches query: ${query}`
      );
    }
  });
};
