module.exports = controller => {
  controller.on("file_share", async (bot, message) => {
    bot.reply(`\`\`\`\n${JSON.stringify(message, null, 2)}\n\`\`\``);
  });
};
