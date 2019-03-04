const bukkitService = require("./bukkit");

const Botmock = require("botkit-mock");
global.Math = require("../testing/mock-math-random");

const nock = require("nock");
const scrapedDataBukkit = require("../testing/fixtures/scraped-data-bukkit");
const scrapedDataFloops = require("../testing/fixtures/scraped-data-floops");
const storageDataMultiple = require("../testing/fixtures/storage-data-bukkits-multiple-sources");
const storageDataSingle = require("../testing/fixtures/storage-data-bukkits-single-source");

beforeEach(() => {
  this.controller = Botmock({
    debug: false,
    log: false,
    disable_startup_messages: true
  });
});

test("reload: request fails", async () => {
  expect.assertions(1);

  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(500);

  await expect(bukkitService.reload(this.controller)).rejects.toBe(
    "500: https://bukk.it/"
  );
});

test("reload: request has no bukkits", async () => {
  expect.assertions(1);

  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(200, "");

  await expect(bukkitService.reload(this.controller)).rejects.toBe(
    "https://bukk.it/: no bukkits found"
  );
});

test("reload: request has bukkits", async () => {
  expect.assertions(2);

  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(200, scrapedDataBukkit);

  await expect(bukkitService.reload(this.controller)).resolves.toBe(
    "3 bukkits loaded"
  );

  this.controller.storage.teams.get("bukkits", (err, data) => {
    expect(data).toMatchObject(storageDataSingle);
  });
});

test("reload: multiple bukkit sources", async () => {
  expect.assertions(2);

  this.controller.storage.teams.save(
    { id: "bukkitSources", values: ["https://floops.io/"] },
    () => {}
  );

  nock("https://bukk.it", { encodedQueryParams: true })
    .get("/")
    .reply(200, scrapedDataBukkit);

  nock("https://floops.io", { encodedQueryParams: true })
    .get("/")
    .reply(200, scrapedDataFloops);

  await expect(bukkitService.reload(this.controller)).resolves.toBe(
    "5 bukkits loaded"
  );

  this.controller.storage.teams.get("bukkits", (err, data) => {
    expect(data).toEqual(storageDataMultiple);
  });
});

test("find: prompts reload bukkits if no bukkits", async () => {
  expect.assertions(1);
  await expect(
    bukkitService.find(this.controller, undefined, undefined)
  ).rejects.toBe("No bukkits. Try `/reload-bukkits`");
});

test("find: returns a message if no match", async () => {
  expect.assertions(1);
  this.controller.storage.teams.save(storageDataMultiple, () => {});
  await expect(
    bukkitService.find(this.controller, "foo", undefined)
  ).resolves.toBe("Couldn’t find a match.");
});

test("find: returns a random item without query", async () => {
  expect.assertions(1);
  this.controller.storage.teams.save(storageDataMultiple, () => {});
  await expect(
    bukkitService.find(this.controller, undefined, undefined)
  ).resolves.toBe("https://floops.io/one.gif");
});

test("find: returns an item that matches query", async () => {
  expect.assertions(1);
  this.controller.storage.teams.save(storageDataMultiple, () => {});
  await expect(
    bukkitService.find(this.controller, "two", undefined)
  ).resolves.toBe("https://floops.io/two.jpg");
});

test("find: returns an item that matches query and source", async () => {
  expect.assertions(1);
  this.controller.storage.teams.save(storageDataMultiple, () => {});
  await expect(
    bukkitService.find(this.controller, "one", "floops")
  ).resolves.toBe("https://floops.io/one.gif");
});
