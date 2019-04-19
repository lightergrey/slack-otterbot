var request = require("request");

module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      // try {
      const url = message.files[0].url_private;

      const opts = {
        method: "GET",
        url: url,
        headers: {
          Authorization: "Bearer " + bot.config.bot.token // Authorization header with bot's access token
        }
      };

      request(opts, function(err, res, body) {
        // body contains the content
        console.log("FILE RETRIEVE STATUS", res.statusCode);
        console.log("**************");
        console.log(JSON.stringify(body));
        console.log("**************");
      });

      // console.log("**************");
      // console.log(JSON.stringify(response));
      // console.log("**************");

      // const json = await response.json();
      // console.log("**************");
      // console.log(JSON.stringify(json));
      // console.log("**************");
      // } catch (err) {
      // bot.replyPublicDelayed(message, `${err}`);
      // }
    }
  });
};
