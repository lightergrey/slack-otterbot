module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    console.log("******************");
    console.log(JSON.stringify(message));
    console.log("******************");
    bot.replyAcknowledge();
    bot.replyPublicDelayed(
      `\`\`\`\n${JSON.stringify(message, null, 2)}\n\`\`\``
    );
  });
};
