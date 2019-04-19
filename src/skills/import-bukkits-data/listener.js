const request = require("request");
const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.on("file_share", (bot, message) => {
    if (
      message.files &&
      message.files[0] &&
      message.files[0].name === "bukkits-data.json"
    ) {
      bot.replyAcknowledge();

      const url = message.files[0].url_private;

      const opts = {
        method: "GET",
        url: url,
        headers: {
          Authorization: `Bearer ${bot.config.bot.token}`
        }
      };

      request(opts, async (err, res, body) => {
        if (res.statusCode !== 200) {
          console.error(`error: ${res.statusCode}`);
          console.error(`error: ${err}`);
        }
        try {
          const data = JSON.parse(body);
          await bukkitService.saveData(controller, data);
          bot.replyPublicDelayed(message, "bukkit data imported");
        } catch (err) {
          const errorResponse = `'import bukkits data' error: ${err}`;
          bot.replyPublicDelayed(message, errorResponse);
          console.error(errorResponse);
        }
      });
    }
  });
};
