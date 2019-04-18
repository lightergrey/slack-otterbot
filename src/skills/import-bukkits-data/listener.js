const fetch = require("node-fetch");

module.exports = controller => {
  controller.on("file_share", async (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      try {
        const url = message.files[0].url_private;
        bot.reply(message, `this is a valid data file: ${url}`);

        const response = await fetch(url);
        bot.replyPublicDelayed(message, "GOT RESPONSE");
        console.log(response);

        bot.replyPublicDelayed(message, `${response}`);
      } catch (err) {
        bot.replyPublicDelayed(message, `${err}`);
      }
    }
  });
};
