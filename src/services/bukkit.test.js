const bukkitService = require("./bukkit");
const Botmock = require("botkit-mock");
const nock = require("nock");

beforeEach(() => {
  this.controller = Botmock({ debug: false, log: false });
});

test("reloads bukkits", () => {
  expect.assertions(1);
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
            <tr>
              <td><a href="three.gif">three.gif</a></td>
              <td>2014-08-06 14:18</td>
              <td>1.2M</td>
            </tr>
          </table>
        </body>
      </html>
      `
    );

  return bukkitService
    .reload(this.controller)
    .then(reply => expect(reply).toEqual("3 bukkits loaded"));
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
