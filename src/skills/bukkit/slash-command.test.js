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
  const input = getMockUserInput("/other", "");

  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).not.toHaveBeenCalled();
    expect(message).toMatchObject({});
  });
});

test("detects a query and source", () => {
  const input = getMockUserInput("/bukkit", "foo from bar");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(() => {
    const [, query, source] = bukkitService.find.mock.calls[0];
    expect(query).toEqual("foo");
    expect(source).toEqual("bar");
  });
});

test("responds with text from bukkit service find resolve", () => {
  const input = getMockUserInput("/bukkit", "");

  bukkitService.find.mockResolvedValueOnce({
    source: "http://bukk.it/",
    name: "two.gif",
    url: "http://bukk.it/two.gif"
  });

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
    expect(message.blocks).toEqual([
      {
        alt_text: " ",
        image_url: "http://bukk.it/two.gif",
        title: {
          emoji: true,
          text: "http://bukk.it/two.gif",
          type: "plain_text"
        },
        type: "image"
      },
      {
        elements: [
          {
            text: "From <@someUserId>",
            type: "mrkdwn"
          }
        ],
        type: "context"
      }
    ]);
  });
});

test("responds with text from bukkit service find reject", () => {
  const input = getMockUserInput("/bukkit", "");
  const expectedErrorMessage = "'/bukkit' error: find rejected text";

  bukkitService.find.mockRejectedValueOnce("find rejected text");

  expect.assertions(3);
  return this.bot.usersInput([input]).then(() => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
    expect(console.error).toBeCalledWith(expectedErrorMessage);
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      expectedErrorMessage
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
