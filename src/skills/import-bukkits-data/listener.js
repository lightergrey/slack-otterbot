module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    console.log(JSON.stringify(message));
    bot.reply(message, `\`\`\`\n${JSON.stringify(message, null, 2)}\n\`\`\``);
  });
};
