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

        const response = await fetch(url, {
          headers: {
            Authorization: "Bearer " + bot.config.bot.token // Authorization header with bot's access token
          }
        });

        console.log("**************");
        console.log(JSON.stringify(response));
        console.log("**************");

        const json = await response.json();
        console.log("**************");
        console.log(JSON.stringify(json));
        console.log("**************");

        // const response = await fetch(url);
        // bot.replyPublicDelayed(message, "GOT RESPONSE");
        // const json = await response.json();
        // console.log("*********");
        // console.log(JSON.stringify(json));
        // console.log("*********");
        // bot.replyPublicDelayed(message, `${response}`);
      } catch (err) {
        bot.replyPublicDelayed(message, `${err}`);
      }
    }
  });
};
