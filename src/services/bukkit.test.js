const bukkitService = require("./bukkit");
const Botmock = require("botkit-mock");

beforeEach(() => {
  this.controller = Botmock({ debug: false, log: false });
});

test("reloads bukkits", () => {
  expect.assertions(1);

  return bukkitService
    .reload(this.controller)
    .then(reply => expect(reply).toEqual("0 bukkits loaded"));
});

test("find: prompts reload bukkits if no bukkits", () => {
  expect.assertions(1);

  return bukkitService
    .find(this.controller, undefined, undefined)
    .then(reply => expect(reply).toEqual("No bukkits. Try `/reload-bukkits`"));
});

test("find: returns a random item without query", () => {
  expect.assertions(1);

  const data = {
    id: "bukkits",
    values: [
      {
        fileName: "foo",
        source: "https://bukk.it/"
      }
    ]
  };

  this.controller.storage.teams.save(data, () => {});

  return bukkitService
    .find(this.controller, undefined, undefined)
    .then(reply => expect(reply).toEqual("https://bukk.it/foo"));
});

test("find: returns an item that matches query", () => {
  expect.assertions(1);

  const data = {
    id: "bukkits",
    values: [
      {
        fileName: "bar",
        source: "https://bukk.it/"
      },
      {
        fileName: "foo",
        source: "https://bukk.it/"
      }
    ]
  };

  this.controller.storage.teams.save(data, () => {});

  return bukkitService
    .find(this.controller, "foo", undefined)
    .then(reply => expect(reply).toEqual("https://bukk.it/foo"));
});

test("find: returns an item that matches query and source", () => {
  expect.assertions(1);

  const data = {
    id: "bukkits",
    values: [
      {
        fileName: "bar",
        source: "https://floops.io/"
      },
      {
        fileName: "bar",
        source: "https://bukk.it/"
      }
    ]
  };

  this.controller.storage.teams.save(data, () => {});

  return bukkitService
    .find(this.controller, "bar", "floops")
    .then(reply => expect(reply).toEqual("https://floops.io/bar"));
});

test("find: returns a message if no match", () => {
  expect.assertions(1);

  const data = {
    id: "bukkits",
    values: [
      {
        fileName: "bar",
        source: "https://bukk.it/"
      }
    ]
  };

  this.controller.storage.teams.save(data, () => {});

  return bukkitService
    .find(this.controller, "foo", undefined)
    .then(reply => expect(reply).toEqual("Couldn’t find a match."));
});
