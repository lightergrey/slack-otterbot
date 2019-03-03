const listener = require("./listener");

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
  listener(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("other", "other");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).not.toHaveBeenCalled();
    return expect(message).toMatchObject({});
  });
});

test("responds with text from bukkit service find resolve", async () => {
  const input = getMockUserInput("bukkit", "resolve");

  bukkitService.find.mockResolvedValueOnce("find response text");

  expect.assertions(2);
  await this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("find response text");
  });
});

test("responds with text from bukkit service find reject", async () => {
  const input = getMockUserInput("bukkit", "reject");
  const expectedErrorMessage = "'bukkit' error: find rejected text";

  bukkitService.find.mockRejectedValueOnce("find rejected text");

  expect.assertions(3);
  await this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(console.error).toBeCalledWith(expectedErrorMessage);
    return expect(message.text).toEqual(expectedErrorMessage);
  });
});

test("responds once to message with the same id", async () => {
  const input = getMockUserInput("bukkit", "multiple");

  bukkitService.find.mockResolvedValueOnce("find response text");

  expect.assertions(3);
  return this.bot.usersInput([input]).then(async message => {
    return this.bot.usersInput([input]).then(message => {
      expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
      expect(this.bot.detailed_answers["someChannel"]).toHaveLength(1);
      return expect(message.text).toEqual("find response text");
    });
  });
});

const getMockUserInput = (text, event_id) => {
  return {
    user: "someUserId",
    channel: "someChannel",
    messages: [
      {
        text,
        isAssertion: true,
        event_id
      }
    ]
  };
};
