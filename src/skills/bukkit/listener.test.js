const Botmock = require("botkit-mock");
const listener = require("./listener");

// Mock random for testing
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.75;
global.Math = mockMath;

const getMockUserInput = (text, type, id) => ({
  user: "someUserId",
  channel: "someChannel",
  type: type || "ambient",
  messages: [
    {
      text,
      isAssertion: true,
      event_id: id
    }
  ]
});

const demoData = {
  id: "bukkits",
  values: [
    { source: "https://foo/", fileName: "cat.gif" },
    { source: "https://bar/", fileName: "dog.gif" },
    { source: "https://foo/", fileName: "dog.gif" },
    { source: "https://foo/", fileName: "otter.gif" },
    { source: "https://bar/", fileName: "cat.gif" }
  ]
};

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
  const input = getMockUserInput("other", null, "other");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).not.toHaveBeenCalled();
    return expect(message).toMatchObject({});
  });
});

test("gives a helpful message if no bukkits found", () => {
  storeData({});
  const input = getMockUserInput("bukkit", null, "no_bukkits");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("No bukkits. Try `/reload-bukkits`");
  });
});

test("responds to 'bukkit' with no query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit", null, "no_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("https://foo/otter.gif");
  });
});

test("responds to 'bukkit' with no bad query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit blerg", null, "bad_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("Couldn’t find a match.");
  });
});

test("responds to 'bukkit' with query", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit dog", null, "with_query");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://foo/dog.gif");
  });
});

test("responds to 'bukkit' with query with source", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit cat from br", null, "with_source");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://bar/cat.gif");
  });
});

test("responds to 'bukkit' with no query in DM", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit", "direct_message", "dm");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://foo/otter.gif");
  });
});

test("responds to 'bukkit' with no query in direct mention", () => {
  storeData(demoData);
  const input = getMockUserInput("bukkit", "direct_mention", "in_direct");
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    return expect(message.text).toEqual("https://foo/otter.gif");
  });
});
