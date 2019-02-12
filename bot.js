if (process.env.NODE_ENV !== "production") {
  const env = require("node-env-file");
  env(__dirname + "/.env");
}

const Botkit = require("botkit");
const bukkitListener = require("./src/skills/bukkit/listener");
const bukkitSlashCommand = require("./src/skills/bukkit/slash-command");
const reloadBukkitsSlashCommand = require("./src/skills/reload-bukkits/slash-command");

let bot_options = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  clientSigningSecret: process.env.clientSigningSecret,
  debug: true,
  scopes: ["bot"]
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
  const mongoStorage = require("botkit-storage-mongo")({
    mongoUri: process.env.MONGO_URI
  });
  bot_options.storage = mongoStorage;
} else {
  bot_options.json_file_store = __dirname + "/.data/db/"; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
let controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require(__dirname + "/components/express_webserver.js")(
  controller
);

webserver.get("/", (req, res) => {
  res.render("index", {
    domain: req.get("host"),
    protocol: req.protocol,
    layout: "layouts/default"
  });
});

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + "/components/user_registration.js")(controller);

// Send an onboarding message when a new team joins
require(__dirname + "/components/onboarding.js")(controller);

// Set up skills
bukkitListener(controller);
bukkitSlashCommand(controller);
reloadBukkitsSlashCommand(controller);
