const RequestHandler = require("../RequestHandler");
const { existsSync, unlinkSync } = require("fs");
const { exists } = require("../models/Account");
const { createProfileImageUploadFunction } = require("../services/fileUpload");
const { Account } = require("../models");

const uploadProfileImage = createProfileImageUploadFunction();

module.exports = class FilesController {
    static async getOne(req, res) {
        try {
            Logger.info("getting file in files controller...");
            const filename = req.params.filename;

            const path = global.appRoot + "/uploads/" + filename;

            if (!existsSync(path)) {
                RequestHandler.throwError(404, "File Not Found")();
            }

            RequestHandler.sendFile(req.requestId, res, path, 200);
        } catch (error) {
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async addProfileImage(req, res) {
        Logger.info("add profile image in files controller...");
        const filename = req.params.filename;

        uploadProfileImage(req, res, async (error) => {
            try {
                if (error) {
                    const err = new Error(error);
                    err.status = 400;
                    return RequestHandler.sendError(req.requestId, res, err);
                }

                const updation = await Account.updateOne(
                    { _id: req.auth._id },
                    { profileImage: req.file.filename }
                );

                if (!updation.acknowledged) {
                    RequestHandler.throwError(
                        400,
                        "Error adding the profile image"
                    )();
                }

                RequestHandler.sendSuccess(
                    req.requestId,
                    res,
                    "Profile Uploaded Successfully"
                );
            } catch (error) {
                RequestHandler.sendError(req.requestId, res, error);
            }
        });
    }
};
