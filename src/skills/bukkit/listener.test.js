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
    expect(message).toMatchObject({});
  });
});

test("detects a query and source", () => {
  const input = getMockUserInput("bukkit foo from bar", "params");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    const [, query, source] = bukkitService.find.mock.calls[0];
    expect(query).toEqual("foo");
    expect(source).toEqual("bar");
  });
});

test("responds with text from bukkit service find resolve", () => {
  const input = getMockUserInput("bukkit", "resolve");

  bukkitService.find.mockResolvedValueOnce({
    source: "http://bukk.it/",
    name: "two.gif",
    url: "http://bukk.it/two.gif"
  });

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
    expect(message.text).toEqual("http://bukk.it/two.gif");
  });
});

test("responds with text from bukkit service find reject", () => {
  const input = getMockUserInput("bukkit", "reject");
  const expectedErrorMessage = "'bukkit' error: find rejected text";

  bukkitService.find.mockRejectedValueOnce("find rejected text");

  expect.assertions(3);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
    expect(console.error).toBeCalledWith(expectedErrorMessage);
    expect(message.text).toEqual(expectedErrorMessage);
  });
});

test("responds once to message with the same id", () => {
  const input = getMockUserInput("bukkit", "multiple");

  bukkitService.find.mockResolvedValueOnce({
    source: "http://bukk.it/",
    name: "two.gif",
    url: "http://bukk.it/two.gif"
  });

  expect.assertions(3);
  return this.bot.usersInput([input]).then(message => {
    return this.bot.usersInput([input]).then(message => {
      expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
      expect(this.bot.detailed_answers["someChannel"]).toHaveLength(1);
      expect(message.text).toEqual("http://bukk.it/two.gif");
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
