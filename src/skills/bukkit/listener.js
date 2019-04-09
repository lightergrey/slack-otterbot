const bukkitService = require("../../services/bukkit");
let lastEventId;

module.exports = controller => {
  controller.hears(
    [/^bukkit\s?([\w-]+)?(?: from (\w+))?$/i],
    "direct_message, direct_mention, ambient",
    async (bot, message) => {
      /**
        The bot was replying with multiple bukkits when a long time had ellapsed between interacting with it. My suspicion is that this was due to the heroku dyno going to sleep and the bot not acknowledging receiving the message quick enough (300ms) causing Slack to resend the message 3 times. This fix may not be necessary since we upgraded to the hobby dyno.
      */
      if (message["event_id"] === lastEventId) {
        return;
      }

      lastEventId = message["event_id"];
      bot.replyAcknowledge();
      const [, query, source] = message.match;

      try {
        const bukkit = await bukkitService.find(controller, query, source);
        bot.reply(message, bukkit.url);
      } catch (err) {
        const errorResponse = `'bukkit' error: ${err}`;
        bot.reply(message, errorResponse);
        console.error(errorResponse);
      }
    }
  );
};
