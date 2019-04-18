const request = require("request");

module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      const url = message.files[0].url_private;
      bot.reply(message, `this is a valid data file: ${url}`);

      request.get(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const data = JSON.parse(body);
          bot.replyPublicDelayed(message, "I got data!");
          if (data.sources["https://bukk.it/"]["qaz.gif"] !== undefined) {
            bot.replyPublicDelayed(message, "I got NEW data!");
          }
          console.log(data);
        }
      });
    }
  });
};
