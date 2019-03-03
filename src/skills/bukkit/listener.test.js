const listener = require("./listener");

global.Math = require("../../testing/mock-math-random");
const Botmock = require("botkit-mock");
const demoData = require("../../testing/fixtures/storage-data-bukkits-multiple-sources");
const getMockUserInput = require("../../testing/get-mock-user-input");

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
  listener(this.controller);
});

test("does not respond to other", () => {
  storeData(demoData);
  const input = getMockUserInput("other", "other");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).not.toHaveBeenCalled();
    return expect(message).toMatchObject({});
  });
});

test("gives a helpful message if no bukkits found", () => {
  const input = getMockUserInput("bukkit", "no_bukkits");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("No bukkits. Try `/reload-bukkits`");
  });
});

test("responds to 'bukkit' and no query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit", "no_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("https://bukk.it/three.png");
  });
});

test("responds to 'bukkit' and bad query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit blerg", "bad_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("Couldn’t find a match.");
  });
});

test("responds to 'bukkit' and query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit two", "with_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://bukk.it/two.jpg");
  });
});

test("responds to 'bukkit' and query with source", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit two from flo", "with_source");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://floops.io/two.jpg");
  });
});
