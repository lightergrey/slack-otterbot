const slashCommand = require("./slash-command");

global.Math = require("../../testing/mock-math-random");
const Botmock = require("botkit-mock");
const demoData = require("../../testing/fixtures/storage-data-bukkits-multiple-sources");

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

const storeData = data => {
  this.controller.storage.teams.save(data, () => {});
};

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
  storeData(demoData);
  const input = getMockUserInput("/other");
  return this.bot.usersInput([input]).then(message => {
    return expect(message).toMatchObject({});
  });
});

test("gives a helpful message if no bukkits found", () => {
  storeData({});
  const input = getMockUserInput("/bukkit", "");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("No bukkits. Try `/reload-bukkits`");
  });
});

test("responds to 'bukkit' with no query", () => {
  storeData(demoData);
  const input = getMockUserInput("/bukkit", "");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("https://foo/otter.gif");
  });
});

test("responds to 'bukkit' with no bad query", () => {
  storeData(demoData);
  const input = getMockUserInput("/bukkit", "blerg");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("Couldn’t find a match.");
  });
});

test("responds to 'bukkit' with query", () => {
  storeData(demoData);
  const input = getMockUserInput("/bukkit", "dog");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("https://foo/dog.gif");
  });
});

test("responds to 'bukkit' with query with source", () => {
  storeData(demoData);
  const input = getMockUserInput("/bukkit", "cat from br");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("https://bar/cat.gif");
  });
});
