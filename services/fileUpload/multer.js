const multer = require("multer");
const { extname } = require("path");
const { existsSync, mkdirSync } = require("fs");
const { sysConfig } = require("../../config");

function createProjectAttachmentsStorage() {
    const dir = global.appRoot + "/uploads";

    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    const storage = multer.diskStorage({
        destination: dir,
        filename: (req, file, cb) => {
            let filename = `Project_${req.params.projectId}_Attachment_${file.originalname}`;

            cb(null, filename);
        },
    });

    return storage;
}

function projectAttachmentsFilter(file, cb) {
    const filetypes = /jpg|jpeg|png|gif|pdf|doc|docx/;

    const ext = filetypes.test(extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype.toLowerCase());

    if (ext) {
        return cb(null, true);
    }

    return cb("All files must be an image, pdf or word document");
}

function createProjectAttachmentsUploadFunction(storage) {
    if (!storage) {
        storage = createProjectAttachmentsStorage();
    }

    upload = multer({
        storage: storage,
        limits: { fileSize: sysConfig.IMAGE_MAX_SIZE },
        fileFilter: (req, file, cb) => {
            projectAttachmentsFilter(file, cb);
        },
    }).array("attachments", sysConfig.MAX_PROJECT_ATTACHMENTS);

    return upload;
}

function createProjectAttachmentsUPdateUploadFunction(storage) {
    if (!storage) {
        storage = createProjectAttachmentsStorage();
    }

    upload = multer({
        storage: storage,
        limits: { fileSize: sysConfig.IMAGE_MAX_SIZE },
        fileFilter: (req, file, cb) => {
            projectAttachmentsFilter(file, cb);
        },
    }).array("attachmentsToAdd", sysConfig.MAX_PROJECT_ATTACHMENTS);

    return upload;
}

/**
 * Profile Image Upload
 */

function imageFilter(file, cb) {
    const filetypes = /jpg|jpeg|png|gif/;

    const ext = filetypes.test(extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype.toLowerCase());

    if (ext && mimetype) {
        return cb(null, true);
    }

    return cb("The File must be an Image");
}

function createProfilesImagesStorage() {
    const dir = global.appRoot + "/uploads";

    if (!existsSync(dir)) {
        mkdirSync(dir);
    }

    const storage = multer.diskStorage({
        destination: dir,
        filename: (req, file, cb) => {
            let filename = `Profile_${req.auth._id}${extname(
                file.originalname
            )}`;

            cb(null, filename);
        },
    });

    return storage;
}

function createProfileImageUploadFunction(storage) {
    if (!storage) {
        storage = createProfilesImagesStorage();
    }

    upload = multer({
        storage: storage,
        limits: { fileSize: sysConfig.IMAGE_MAX_SIZE },
        imageFilter: (req, file, cb) => {
            imageFilter(file, cb);
        },
    }).single("profileImage");

    return upload;
}

module.exports = {
    createProjectAttachmentsUploadFunction,
    createProjectAttachmentsUPdateUploadFunction,
    createProfileImageUploadFunction,
};
