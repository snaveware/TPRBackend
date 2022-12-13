/**
 * packages: multer, path
 */

const {
    createProjectAttachmentsUploadFunction,
    createProjectAttachmentsUPdateUploadFunction,
    createProfileImageUploadFunction,
} = require("./multer");

module.exports = {
    createProjectAttachmentsUploadFunction,
    createProjectAttachmentsUPdateUploadFunction,
    createProfileImageUploadFunction,
};
