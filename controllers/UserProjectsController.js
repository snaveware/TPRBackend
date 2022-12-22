const RequestHandler = require("../RequestHandler");
const { Project } = require("../models");
const ObjectId = require("mongoose").Types.ObjectId;
const Logger = require("../Logger");
const Validator = require("../services/projects/Validator");

module.exports = class UserProjectsController {
    static async getOne(req, res) {
        Logger.info(
            "get many function in projects controller. fetching the listings ..."
        );

        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid id")();
            }
            let project = await Project.findOne({
                _id: req.params.projectId,
                "owner.id": req.auth._id,
            });
            if (!project) {
                RequestHandler.throwError(
                    404,
                    "The project you request could not be found"
                )();
            }

            if (req.auth && project.likes.indexOf(req.auth._id) != -1) {
                project = { ...project._doc, isLikedByMe: true };
            } else {
                project = { ...project._doc, isLikedByMe: false };
            }

            RequestHandler.sendSuccess(req.requestId, res, project);
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async getMany(req, res) {
        console.log(req.query);
        Logger.info(
            "get many function in projects controller. fetching the listings ..."
        );

        try {
            const validated = await Validator.validateGetOptions(req.query);
            const options = { "owner.id": req.auth._id };

            if (validated.category || validated.searchString) {
                options.$and = [];
            }

            if (validated.category) {
                options.$and.push({ category: validated.category });
            }

            if (validated.searchString) {
                options.$and.push({
                    $or: [
                        {
                            category: {
                                $regex: new RegExp(validated.searchString, "i"),
                            },
                        },
                        {
                            title: {
                                $regex: new RegExp(validated.searchString, "i"),
                            },
                        },
                        {
                            "owner.name": {
                                $regex: new RegExp(validated.searchString, "i"),
                            },
                        },
                        {
                            summary: {
                                $regex: new RegExp(validated.searchString, "i"),
                            },
                        },
                        {
                            description: {
                                $regex: new RegExp(validated.searchString, "i"),
                            },
                        },
                    ],
                });
            }
            const count = await Project.countDocuments(options);
            let projects = await Project.find(options)
                .skip(validated.noOfProjectsPerPage * (validated.page - 1))
                .limit(validated.noOfProjectsPerPage)
                .sort([["_id", "desc"]]);

            if (req.auth) {
                projects = projects.map((project) => {
                    if (req.auth && project.likes.indexOf(req.auth._id) != -1) {
                        project = { ...project._doc, isLikedByMe: true };
                    } else {
                        project = { ...project._doc, isLikedByMe: false };
                    }

                    return project;
                });
            }

            RequestHandler.sendSuccess(req.requestId, res, { count, projects });
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }
};
