module.exports = controller => {
  controller.on("slash_command", function(bot, message) {
    if (message.command === "bukkit") {
      bot.replyPrivate(
        message,
        "Only the person who used the slash command can see this."
      );
    }
  });
};
