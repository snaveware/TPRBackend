const { connect } = require("mongoose");
const { Account, Enum, Package } = require("./models");
const { dbConfig, adminPermissions } = require("./config");
const Logger = require("./Logger");

function connectDatabase() {
    Logger.info("Connecting to database...");
    console.log("Connecting to database...");

    const dbString = dbConfig.DB_CONNECTION_STRING;

    if (!dbString) {
        return Logger.error(` No database string provided`);
    }

    try {
        connect(dbString);
    } catch (error) {
        Logger.error(`failed to connect to database error: ${error}`);
        process.emit("SIGINT", { reason: "Failed to connect to database" });
    }
}

async function setupAdminAccount() {
    console.log("Ensuring the system has a admin...");
    const accounts = await Account.find({
        accessLevel: adminPermissions.accessLevel,
    }).limit(1);
    if (accounts.length > 0) {
        Logger.info("Found possible admin account");
        return;
    }

    try {
        Logger.info("admin account not found, Creating new admin account...");

        let admin = new Account(dbConfig.ADMIN);

        const createdAdmin = await admin.save();

        Logger.info("Finished creating admin account");

        return;
    } catch (error) {
        Logger.error(`Failed to create admin account, error: ${error}`);
        console.log("Failed to create admin account");
        process.emit("SIGINT", { reason: "Could not create admin account" });
    }
}

module.exports = { connectDatabase, setupAdminAccount };
