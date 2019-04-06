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
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "query required"
    );
  });
});

test("responds with blocks from bukkit service search resolve", () => {
  const input = getMockUserInput("/search-bukkits", "foo");

  bukkitService.search.mockResolvedValueOnce({ text: "search resolve text" });

  expect.assertions(1);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.blocks).toEqual({
      text: "search resolve text"
    });
  });
});

test("responds with text from bukkit service search reject", () => {
  const input = getMockUserInput("/search-bukkits", "foo");

  bukkitService.search.mockRejectedValueOnce("search reject text");

  expect.assertions(1);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
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
