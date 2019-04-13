const slashCommand = require("./slash-command");

const Botmock = require("botkit-mock");
global.console = { error: jest.fn() };
jest.mock("../../services/bukkit");
const bukkitService = require("../../services/bukkit");

beforeEach(() => {
  this.controller = Botmock({
    debug: false,
    log: false,
    disable_startup_messages: true
  });
  this.bot = this.controller.spawn({ type: "slack" });
  this.bot.replyAcknowledge = jest.fn();
  slashCommand(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("/other");

  return this.bot.usersInput([input]).then(message => {
    return expect(message).toMatchObject({});
  });
});

test("requires query text", () => {
  const input = getMockUserInput("/search-bukkits", "");

  expect.assertions(1);
  return this.bot.usersInput([input]).then(() => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "query required"
    );
  });
});

test("responds with blocks from bukkit service search resolve", () => {
  const input = getMockUserInput("/search-bukkits", "tw");

  bukkitService.search.mockResolvedValueOnce([
    {
      url: "https://bukk.it/two.jpg",
      source: "https://bukk.it/",
      name: "two.jpg"
    },
    {
      url: "https://floops.io/two.jpg",
      source: "https://floops.io/",
      name: "two.jpg"
    }
  ]);

  expect.assertions(2);
  return this.bot.usersInput([input]).then(() => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "searching bukkits"
    );

    expect(this.bot.api.logByKey["replyInteractive"][0].json.blocks).toEqual([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: 'Found *2 bukkits* matching "tw"'
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*<https://bukk.it/two.jpg>*"
        },
        accessory: {
          type: "image",
          image_url: "https://bukk.it/two.jpg",
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
            value: "https://bukk.it/two.jpg"
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*<https://floops.io/two.jpg>*"
        },
        accessory: {
          type: "image",
          image_url: "https://floops.io/two.jpg",
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
            value: "https://floops.io/two.jpg"
          }
        ]
      },
      {
        type: "divider"
      }
    ]);
  });
});

test("responds with text from bukkit service search reject", () => {
  const input = getMockUserInput("/search-bukkits", "foo");

  bukkitService.search.mockRejectedValueOnce("search reject text");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(() => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "searching bukkits"
    );

    expect(this.bot.api.logByKey["replyPrivate"][1].json.text).toEqual(
      "'/search-bukkits' error: search reject text"
    );
  });
});

const getMockUserInput = (command, text) => ({
  type: "slash_command",
  user: "someUserId",
  channel: "someChannel",
  messages: [
    {
      text,
      command,
      isAssertion: true
    }
  ]
});
