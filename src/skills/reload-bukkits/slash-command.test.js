const slashCommand = require("./slash-command");

const Botmock = require("botkit-mock");
const nock = require("nock");
const scrapedDataBukkit = require("../../testing/fixtures/scraped-data-bukkit");
const storageDataSingleSource = require("../../testing/fixtures/storage-data-bukkits-single-source");

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
    .reply(200, scrapedDataBukkit);

  const input = getMockUserInput("/reload-bukkits", "");

  expect.assertions(5);

  return this.bot.usersInput([input]).then(() => {
    const initialReply = this.bot.api.logByKey["replyPrivate"][0].json;
    const confirmationReply = this.bot.api.logByKey["replyPrivate"][1].json;

    expect(initialReply.text).toEqual("reloading bukkits");
    expect(initialReply.response_type).toEqual("ephemeral");

    expect(confirmationReply.text).toEqual("3 bukkits loaded");
    expect(confirmationReply.response_type).toEqual("ephemeral");

    this.controller.storage.teams.get("bukkits", (err, data) => {
      return expect(data).toEqual(storageDataSingleSource);
    });
  });
});
