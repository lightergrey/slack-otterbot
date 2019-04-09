const bukkitService = require("../../services/bukkit");

const formatBukkitAsBlock = (bukkit, userId) => {
  return [
    {
      type: "image",
      title: {
        type: "plain_text",
        text: `${bukkit.url}`,
        emoji: true
      },
      image_url: `${bukkit.url}`,
      alt_text: " "
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `From <@${userId}>`
        }
      ]
    }
  ];
};

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/bukkit") {
      return;
    }

    bot.replyAcknowledge();
    const [, query, source] = message.text.match(/^([\w-]+)?(?: from (\w+))?$/);

    try {
      const bukkit = await bukkitService.find(controller, query, source);
      const blocks = formatBukkitAsBlock(bukkit, message.user);
      bot.reply(message, { blocks });
    } catch (err) {
      const errorResponse = `'/bukkit' error: ${err}`;
      bot.replyPrivateDelayed(message, errorResponse);
      console.error(errorResponse);
    }
  });
};
