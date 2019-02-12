const Botmock = require("botkit-mock");
const listener = require("./listener");

const bukkitService = require("../../services/bukkit");
jest.mock("../../services/bukkit");

const getMockUserInput = text => ({
  user: "someUserId",
  channel: "someChannel",
  messages: [
    {
      text,
      isAssertion: true
    }
  ]
});

beforeEach(() => {
  this.controller = Botmock({ debug: false, log: false });
  this.bot = this.controller.spawn({ type: "slack" });
  listener(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("other");
  return this.bot.usersInput([input]).then(message => {
    return expect(bukkitService.find).not.toHaveBeenCalled();
  });
});

test("responds to 'bukkit' with no query", () => {
  const input = getMockUserInput("bukkit");
  bukkitService.find.mockReturnValue("random-gif");
  return this.bot.usersInput([input]).then(message => {
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      undefined,
      undefined
    );
    return expect(message.text).toEqual("random-gif");
  });
});

test("responds to 'bukkit' with query", () => {
  const input = getMockUserInput("bukkit cat");
  bukkitService.find.mockReturnValue("cat-gif");
  return this.bot.usersInput([input]).then(message => {
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      "cat",
      undefined
    );
    return expect(message.text).toEqual("cat-gif");
  });
});

test("responds to 'bukkit' with query with source", () => {
  const input = getMockUserInput("bukkit cat from floop");
  bukkitService.find.mockReturnValue("cat-gif-from-floop");
  return this.bot.usersInput([input]).then(message => {
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      "cat",
      "floop"
    );
    return expect(message.text).toEqual("cat-gif-from-floop");
  });
});
