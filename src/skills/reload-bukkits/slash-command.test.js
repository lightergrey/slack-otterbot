const Botmock = require("botkit-mock");
const slashCommand = require("./slash-command");
const nock = require("nock");

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

test("responds to '/reload-bukkits'", () => {
  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(
      200,
      `
      <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
      <html>
        <body>
          <table>
            <tr>
              <td><a href="one.gif">one.gif</a></td>
              <td>2014-04-22 11:30</td>
              <td>297K</td>
            </tr>
            <tr>
              <td><a href="two.jpg">two.jpg</a></td>
              <td>2016-04-05 19:59</td>
              <td>55K</td>
            </tr>
          </table>
        </body>
      </html>
      `
    );

  const input = getMockUserInput("/reload-bukkits", "");

  return this.bot.usersInput([input]).then(() => {
    const initialReply = this.bot.api.logByKey["replyPrivate"][0].json;
    const confirmationReply = this.bot.api.logByKey["replyPrivate"][1].json;

    expect(initialReply.text).toEqual("reloading bukkits");
    expect(initialReply.response_type).toEqual("ephemeral");

    expect(confirmationReply.text).toEqual("2 bukkits loaded");
    expect(confirmationReply.response_type).toEqual("ephemeral");
  });
});
