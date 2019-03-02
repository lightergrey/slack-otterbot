const bukkitService = require("../../services/bukkit");
let lastEventId;

module.exports = controller => {
  controller.hears(
    [/^bukkit\s?([\w-]+)?(?: from (\w+))?$/i],
    "direct_message, direct_mention, ambient",
    async (bot, message) => {
      try {
        if (message["event_id"] === lastEventId) {
          console.log(
            `*** already replied to this one. event_id: ${message["event_id"]}`
          );
        } else {
          lastEventId = message["event_id"];
          console.log(
            `*** reply to this one once. event_id: ${message["event_id"]}`
          );
        }
        bot.replyAcknowledge(() => {
          console.log(`*** replyAcknowledge callback called`);
        });
        console.log(`*** message: ${JSON.stringify(message)}`);
        const [, query, source] = message.match;
        const reply = await bukkitService.find(controller, query, source);
        console.log(`*** reply: ${reply}`);
        bot.reply(message, reply);
      } catch (err) {
        bot.reply(message, `Error getting bukkit: ${err}`);
      }
    }
  );
};
