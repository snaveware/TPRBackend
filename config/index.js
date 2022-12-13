const dbConfig = require("./db");
const { adminPermissions, normalPermissions } = require("./permissions");

const sysConfig = require("./system");

module.exports = {
    sysConfig,
    dbConfig,
    adminPermissions,
    normalPermissions,
};
