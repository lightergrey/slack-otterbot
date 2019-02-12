const Botmock = require("botkit-mock");
const slashCommand = require("./slash-command");

const bukkitService = require("../../services/bukkit");
jest.mock("../../services/bukkit");

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

beforeEach(() => {
  this.controller = Botmock({ debug: false, log: false });
  this.bot = this.controller.spawn({ type: "slack" });
  slashCommand(this.controller);
});

test("does not respond to other", () => {
  const input = getMockUserInput("/other");
  return this.bot.usersInput([input]).then(message => {
    return expect(bukkitService.find).not.toHaveBeenCalled();
  });
});

test("responds to '/reload-bukkits'", () => {
  const input = getMockUserInput("/reload-bukkits", "");
  bukkitService.reload.mockReturnValue("3 bukkits loaded");
  return this.bot.usersInput([input]).then(() => {
    const initialReply = this.bot.api.logByKey["replyPrivate"][0].json;
    const confirmationReply = this.bot.api.logByKey["replyPrivate"][1].json;

    expect(initialReply.text).toEqual("reloading bukkits");
    expect(initialReply.response_type).toEqual("ephemeral");

    expect(bukkitService.reload).toHaveBeenCalled();

    expect(confirmationReply.text).toEqual("3 bukkits loaded");
    expect(confirmationReply.response_type).toEqual("ephemeral");
  });
});
