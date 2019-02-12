const Botmock = require("botkit-mock");
const slashCommand = require("./slash-command");

const bukkitService = require("../../services/bukkit");
jest.mock("../../services/bukkit");

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

beforeEach(() => {
  this.controller = Botmock({ debug: false, log: false });
  this.bot = this.controller.spawn({ type: "slack" });
  this.bot.replyAcknowledge = jest.fn();
  slashCommand(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("/other");
  return this.bot.usersInput([input]).then(message => {
    return expect(bukkitService.find).not.toHaveBeenCalled();
  });
});

test("responds to 'bukkit' with no query", () => {
  const input = getMockUserInput("/bukkit", "");
  bukkitService.find.mockReturnValue("random-gif");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("random-gif");
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      undefined,
      undefined
    );
  });
});

test("responds to 'bukkit' with query", () => {
  const input = getMockUserInput("/bukkit", "cat");
  bukkitService.find.mockReturnValue("cat-gif");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("cat-gif");
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      "cat",
      undefined
    );
  });
});

test("responds to 'bukkit' with query with source", () => {
  const input = getMockUserInput("/bukkit", "cat from floop");
  bukkitService.find.mockReturnValue("cat-gif-from-floop");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("cat-gif-from-floop");
    expect(bukkitService.find).toHaveBeenCalledWith(
      this.controller,
      "cat",
      "floop"
    );
  });
});
