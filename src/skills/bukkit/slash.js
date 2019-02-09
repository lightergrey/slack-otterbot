module.exports = controller => {
  controller.on("slash_command", function(bot, message) {
    bot.replyPrivate(
      message,
      `Only the person who used the slash command can see this. ${JSON.stringify(
        message,
        null,
        2
      )}`
    );
  });
};
