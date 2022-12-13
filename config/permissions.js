const permissionsObj = {
    admin: {
        accessLevel: 1,
        permission: [
            "DEACTIVATE_ACCOUNT",
            "ACTIVATE_ACCOUNT",
            "DELETE_ACCOUNT",
            "CREATE_PROJECT",
            "UPDATE_PROJECT",
            "DELETE_PROJECT",
        ],
    },
    normal: {
        accessLevel: 5,
        permissions: [
            "CREATE_PROJECT",
            "UPDATE_PROJECT",
            "DELETE_PROJECT",
            "COMMENT",
        ],
    },
};

module.exports = {
    adminPermissions: permissionsObj.admin,
    normalPermissions: permissionsObj.normal,
};
