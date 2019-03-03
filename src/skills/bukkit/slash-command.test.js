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
    return expect(message).toMatchObject({});
  });
});

test("responds with text from bukkit service find resolve", async () => {
  const input = getMockUserInput("/bukkit", "");

  bukkitService.find.mockResolvedValueOnce("find response text");

  expect.assertions(2);
  await this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("find response text");
  });
});

test("responds with text from bukkit service find reject", async () => {
  const input = getMockUserInput("/bukkit", "");
  const expectedErrorMessage = "'/bukkit' error: find rejected text";

  bukkitService.find.mockRejectedValueOnce("find rejected text");

  expect.assertions(3);
  await this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(console.error).toBeCalledWith(expectedErrorMessage);
    return expect(this.bot.api.logByKey["replyPrivate"][0].json.text).toEqual(
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
