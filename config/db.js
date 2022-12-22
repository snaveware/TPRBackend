const { hashSync } = require("bcryptjs");
const { adminPermissions } = require("./permissions");

module.exports = {
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
    ADMIN: {
        accessLevel: adminPermissions.accessLevel,
        firstName: "Root",
        lastName: "Admin",
        role: "admin",
        status: "active",
        phoneNumber: process.env.ADMIN_PHONE_NUMBER,
        email: process.env.ADMIN_EMAIL,
        password: hashSync(process.env.ADMIN_PASSWORD, 10),
        permissions: adminPermissions.permission,
    },
};
