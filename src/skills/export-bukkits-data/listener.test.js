const listener = require("./listener");

const Botmock = require("botkit-mock");
global.console = { error: jest.fn() };
jest.mock("../../services/bukkit");
const bukkitService = require("../../services/bukkit");

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
  const input = getMockUserInput("other", "other");

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).not.toHaveBeenCalled();
    expect(message).toMatchObject({});
  });
});

test("uploads a file", () => {
  const input = getMockUserInput("export bukkits data");
  const data = {
    sources: {
      "https://bukk.it/": {
        "one.gif": {
          source: "https://bukk.it/",
          name: "one.gif",
          url: "https://bukk.it/one.gif"
        }
      }
    }
  };

  bukkitService.getData.mockResolvedValueOnce(data);

  expect.assertions(2);
  return this.bot.usersInput([input]).then(() => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    const fileUpload = this.bot.api.logByKey["files.upload"][0];
    expect(fileUpload).toEqual(
      expect.objectContaining({
        content: JSON.stringify(data, null, 2),
        filetype: "json",
        channels: "someChannel",
        filename: expect.stringMatching(/^bukkits-data-\d+.json$/)
      })
    );
  });
});

test("handles file upload error", () => {
  const uploadMock = jest.spyOn(this.bot.api.files, "upload");
  const input = getMockUserInput("export bukkits data");
  const data = {
    sources: {
      "https://bukk.it/": {
        "one.gif": {
          source: "https://bukk.it/",
          name: "one.gif",
          url: "https://bukk.it/one.gif"
        }
      }
    }
  };

  bukkitService.getData.mockResolvedValueOnce(data);
  uploadMock.mockImplementation(() => {
    throw new Error("foo");
  });

  expect.assertions(2);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalled();
    expect(message.text).toEqual("'export bukkits data' error: Error: foo");
  });
});

test("responds with text from bukkit service getData reject", () => {
  const input = getMockUserInput("export bukkits data");
  const expectedErrorMessage =
    "'export bukkits data' error: getData rejected text";

  bukkitService.getData.mockRejectedValueOnce("getData rejected text");

  expect.assertions(3);
  return this.bot.usersInput([input]).then(message => {
    expect(this.bot.replyAcknowledge).toHaveBeenCalledTimes(1);
    expect(console.error).toBeCalledWith(expectedErrorMessage);
    expect(message.text).toEqual(expectedErrorMessage);
  });
});

const getMockUserInput = text => {
  return {
    user: "someUserId",
    channel: "someChannel",
    messages: [
      {
        text,
        isAssertion: true
      }
    ]
  };
};
