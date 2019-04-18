module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      bot.reply(message, "this is a valid data file");
    }
  });
};
