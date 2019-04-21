const bukkitService = require("../../services/bukkit");

module.exports = controller => {
  controller.hears(
    ["export bukkits data"],
    "direct_message",
    async (bot, message) => {
      bot.replyAcknowledge();

      try {
        const data = await bukkitService.getData(controller);

        bot.api.files.upload(
          {
            content: `${JSON.stringify(data, null, 2)}`,
            filename: `bukkits-data-${Date.now()}.json`,
            filetype: "json",
            channels: message.channel
          },
          err => {
            if (err) {
              const errorResponse = `'export bukkits data' error: ${err}`;
              bot.reply(message, errorResponse);
              console.error(errorResponse);
            }
          }
        );
      } catch (err) {
        const errorResponse = `'export bukkits data' error: ${err}`;
        bot.reply(message, errorResponse);
        console.error(errorResponse);
      }
    }
  );
};
