const bukkitService = require("./bukkit");

const Botmock = require("botkit-mock");
global.Math = require("../testing/mock-math-random");

const nock = require("nock");
const scrapedDataBukkit = require("../testing/fixtures/scraped-data-bukkit");
const storageData = require("../testing/fixtures/storage-data-bukkits-multiple-sources");

beforeEach(() => {
  this.controller = Botmock({
    debug: false,
    log: false,
    disable_startup_messages: true
  });
});

test("reloads bukkits", () => {
  expect.assertions(1);
  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(200, scrapedDataBukkit);

  return bukkitService
    .reload(this.controller)
    .then(reply => expect(reply).toEqual("3 bukkits loaded"));
});

test("find: prompts reload bukkits if no bukkits", () => {
  expect(
    bukkitService.find(this.controller, undefined, undefined)
  ).rejects.toBe("No bukkits. Try `/reload-bukkits`");
});

test("find: returns a message if no match", () => {
  this.controller.storage.teams.save(storageData, () => {});
  expect(bukkitService.find(this.controller, "foo", undefined)).resolves.toBe(
    "Couldn’t find a match."
  );
});

test("find: returns a random item without query", () => {
  this.controller.storage.teams.save(storageData, () => {});
  expect(
    bukkitService.find(this.controller, undefined, undefined)
  ).resolves.toBe("https://bukk.it/three.png");
});

test("find: returns an item that matches query", () => {
  this.controller.storage.teams.save(storageData, () => {});
  expect(bukkitService.find(this.controller, "two", undefined)).resolves.toBe(
    "https://bukk.it/two.jpg"
  );
});

test("find: returns an item that matches query and source", () => {
  this.controller.storage.teams.save(storageData, () => {});
  expect(bukkitService.find(this.controller, "one", "floops")).resolves.toBe(
    "https://floops.io/one.gif"
  );
});
