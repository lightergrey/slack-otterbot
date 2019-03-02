const bukkitService = require("../../services/bukkit");
let lastEventId;

module.exports = controller => {
  controller.hears(
    [/^bukkit\s?([\w-]+)?(?: from (\w+))?$/i],
    "direct_message, direct_mention, ambient",
    async (bot, message) => {
      try {
        if (message["event_id"] === lastEventId) {
          return;
        }

        lastEventId = message["event_id"];
        bot.replyAcknowledge();

        const [, query, source] = message.match;
        const reply = await bukkitService.find(controller, query, source);
        bot.reply(message, reply);
      } catch (err) {
        bot.reply(message, `Error getting bukkit: ${err}`);
      }
    }
  );
};
