var request = require("request");

module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      const url = message.files[0].url_private;

      const opts = {
        method: "GET",
        url: url,
        headers: {
          Authorization: `Bearer ${bot.config.bot.token}`
        }
      };

      request(opts, function(err, res, body) {
        if (typeof body === "string" || body instanceof String) {
          console.log("+++++++++");
          console.log("body is a string");
          console.log("+++++++++");
        }
        const data = JSON.parse(body);
        bot.reply(message, `FILE RETRIEVE STATUS: ${res.statusCode}`);
        console.log("**************");
        console.log(data);
        console.log("**************");
      });
    }
  });
};
