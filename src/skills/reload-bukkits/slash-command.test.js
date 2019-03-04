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
  slashCommand(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("/other");

  return this.bot.usersInput([input]).then(message => {
    return expect(message).toMatchObject({});
  });
});

test("responds with text from bukkit service find resolve", () => {
  const input = getMockUserInput("/reload-bukkits", "");

  bukkitService.reload.mockResolvedValueOnce("reload resolve text");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "reloading bukkits"
    );
    expect(this.bot.api.logByKey["replyPrivate"][1].json.text).toEqual(
      "reload resolve text"
    );
  });
});

test("responds with text from bukkit service find reject", () => {
  const input = getMockUserInput("/reload-bukkits", "");

  bukkitService.reload.mockRejectedValueOnce("reload reject text");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
      "reloading bukkits"
    );
    expect(this.bot.api.logByKey["replyPrivate"][1].json.text).toEqual(
      "'/reload-bukkits' error: reload reject text"
    );
  });
});

const getMockUserInput = command => ({
  type: "slash_command",
  user: "someUserId",
  channel: "someChannel",
  messages: [
    {
      text: "",
      command,
      isAssertion: true
    }
  ]
});
