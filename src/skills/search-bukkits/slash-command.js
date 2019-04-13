const bukkitService = require("../../services/bukkit");

const formatBukkitSearchResultsAsBlocks = (bukkits, query) => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Found *${bukkits.length} bukkits* matching "${query}"`
      }
    },
    {
      type: "divider"
    }
  ];

  bukkits.forEach(bukkit => {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${bukkit.url}>*`
        },
        accessory: {
          type: "image",
          image_url: bukkit.url,
          alt_text: " "
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Choose",
              emoji: true
            },
            value: bukkit.url
          }
        ]
      },
      {
        type: "divider"
      }
    );
  });

  return blocks;
};

const formatBlockActionMessageAsBlock = message => {
  return [
    {
      type: "image",
      title: {
        type: "plain_text",
        text: `${message.text}`,
        emoji: true
      },
      image_url: `${message.text}`,
      alt_text: " "
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `From <@${message.user}>`
        }
      ]
    }
  ];
};

module.exports = controller => {
  controller.on("slash_command", async (bot, message) => {
    if (message.command !== "/search-bukkits") {
      return;
    }

    const [, query] = message.text.match(/^([\w-]+)?$/);

    if (!query) {
      bot.replyPrivate(message, `query required`);
    }

    bot.replyPrivate(message, `searching bukkits`);

    try {
      const searchResults = await bukkitService.search(controller, query);
      const blocks = formatBukkitSearchResultsAsBlocks(searchResults, query);
      bot.replyInteractive(message, { blocks });
    } catch (err) {
      bot.replyPrivateDelayed(message, `'/search-bukkits' error: ${err}`);
    }
  });

  controller.on("block_actions", (bot, message) => {
    bot.replyInteractive(message, "done");
    const blocks = formatBlockActionMessageAsBlock(message);
    bot.reply(message, { blocks });
  });
};
