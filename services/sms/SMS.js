const { send } = require("express/lib/response");
const { loggers } = require("winston");
const { sysConfig } = require("../../config");
const messagebird = require("messagebird")(sysConfig.MESSAGEBIRD_API_KEY);
const Logger = require("../../Logger");

module.exports = class SMS {
    send(recipientNumber, message) {
        Logger.info("sending SMS ");

        messagebird.messages.create(
            {
                originator: "TUK Projects",
                recipients: [recipientNumber],
                body: message,
            },

            function (err, response) {
                if (err) {
                    Logger.error(err);
                } else {
                    Logger.debug("SMS sent");
                }
            }
        );
    }
};
