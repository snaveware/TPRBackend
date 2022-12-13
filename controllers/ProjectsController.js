const { projectValidator } = require("../services/projects");
const RequestHandler = require("../RequestHandler");
const { Project } = require("../models");
const { validateNewProject } = require("../services/projects/Validator");
const ObjectId = require("mongoose").Types.ObjectId;
const Logger = require("../Logger");

const {
    createProjectAttachmentsUploadFunction,
    createProjectAttachmentsUPdateUploadFunction,
} = require("../services/fileUpload");
const Validator = require("../services/projects/Validator");
const { validate } = require("../models/Project");

const uploadProjectAttachments = createProjectAttachmentsUploadFunction();
const updateProjectAttachments = createProjectAttachmentsUPdateUploadFunction();

module.exports = class ProjectsController {
    static async getOne(req, res) {
        Logger.info(
            "get many function in projects controller. fetching the listings ..."
        );

        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid id")();
            }
            let project = await Project.findById(req.params.projectId);
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
        Logger.info(
            "get many function in projects controller. fetching the listings ..."
        );

        try {
            const validated = await Validator.validateGetOptions(req.query);
            const options = {};

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

            let projects = await Project.find(options)
                .skip(validated.noOfProjectsPerPage * (validated.page - 1))
                .limit(validated.noOfProjectsPerPage);

            console.log(req.auth);

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

            RequestHandler.sendSuccess(req.requestId, res, projects);
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async createOne(req, res) {
        Logger.info(
            "create one function in projects controller. fetching the listings ..."
        );

        uploadProjectAttachments(req, res, async (error) => {
            try {
                const validated = await projectValidator.validateNewProject(
                    req.body
                );

                if (error) {
                    const err = new Error(error);
                    err.status = 400;
                    return RequestHandler.sendError(req.requestId, res, err);
                }

                validated.owner = {
                    id: req.auth._id,
                    name: `${req.auth.firstName} ${req.auth.lastName}`,
                    profileImage: req.auth.profileImage,
                };

                console.log(req.files);

                if (req.files && req.files.length > 0) {
                    validated.attachments = req.files.map((file) => {
                        return file.filename;
                    });
                }

                const newProject = new Project(validated);

                const createdProject = await newProject.save();

                RequestHandler.sendSuccess(req.requestId, res, createdProject);
            } catch (error) {
                console.error(error);
                RequestHandler.sendError(req.requestId, res, error);
            }
        });
    }

    static async updateOne(req, res) {
        Logger.info(
            "create one function in projects controller. fetching the listings ..."
        );

        updateProjectAttachments(req, res, async (error) => {
            try {
                if (!ObjectId.isValid(req.params.projectId)) {
                    RequestHandler.throwError(400, "Invalid id")();
                }

                const validated = await projectValidator.validateProjectUpdate(
                    req.body
                );

                const project = await Project.findById(req.params.projectId);

                if (!project) {
                    RequestHandler.throwError(
                        404,
                        "The Project You are trying to update could not be found"
                    )();
                }

                if (req.auth._id != project.owner.id) {
                    RequestHandler.throwError(
                        403,
                        "You Do Not have the Permission to Perform the Action you Requested"
                    )();
                }

                if (error) {
                    const err = new Error(error);
                    err.status = 400;
                    return RequestHandler.sendError(req.requestId, res, err);
                }

                if (validated.attachmentsToRemove) {
                    project.attachments = project.attachments.filter(
                        (project) => {
                            return (
                                validated.attachmentsToRemove.indexOf(
                                    project
                                ) == -1
                            );
                        }
                    );
                }

                if (req.files && req.files.length > 0) {
                    req.files.map((file) => {
                        project.attachments.push(file.filename);
                    });
                }

                if (validated.title) {
                    project.title = validated.title;
                }

                if (validated.category) {
                    project.category = validated.category;
                }

                if (validated.contactPhoneNumber) {
                    project.contactPhoneNumber = validated.contactPhoneNumber;
                }

                if (validated.contactEmail) {
                    project.contactEmail = validated.contactEmail;
                }

                if (validated.status) {
                    project.status = validated.status;
                }

                if (validated.link) {
                    project.link = validated.link;
                }

                if (validated.summary) {
                    project.summary = validated.summary;
                }

                if (validated.description) {
                    project.description = validated.description;
                }

                validated.updatedAt = Date.now;

                await project.save();

                RequestHandler.sendSuccess(req.requestId, res, project);
            } catch (error) {
                console.error(error);
                RequestHandler.sendError(req.requestId, res, error);
            }
        });
    }

    static async addLike(req, res) {
        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid id")();
            }

            const project = await Project.findById(req.params.projectId);

            if (!project) {
                RequestHandler.throwError(
                    404,
                    "The Project You are trying to Like could not be found"
                )();
            }

            if (project.likes.indexOf(req.auth._id) != -1) {
                RequestHandler.sendSuccess(req.requestId, res, {
                    noOfLikes: project.likes.length,
                });
                return;
            }

            project.likes.push(req.auth._id);
            project.noOfLikes = project.noOfLikes + 1;

            await project.save();

            RequestHandler.sendSuccess(req.requestId, res, {
                noOfLikes: project.likes.length,
            });
        } catch (error) {
            console.error(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async removeLike(req, res) {
        try {
            const project = await Project.findById(req.params.projectId);

            console.log("project--------", project);

            if (!project) {
                RequestHandler.throwError(
                    404,
                    "The Project Could not be Found"
                )();
            }

            if (project.likes.indexOf(req.auth._id) == -1) {
                RequestHandler.sendSuccess(
                    req.requestId,
                    res,
                    "Unliked Successfully"
                );

                return;
            }

            project.likes = project.likes.filter((liker) => {
                return liker != req.auth._id;
            });

            project.noOfLikes = project.noOfLikes - 1;

            await project.save();

            RequestHandler.sendSuccess(req.requestId, res, {
                noOfLikes: project.noOfLikes,
            });
        } catch (error) {
            console.error(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async deleteOne(req, res) {
        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid id")();
            }

            const project = await Project.findById(req.params.projectId);

            if (!project) {
                RequestHandler.sendSuccess(
                    req.requestId,
                    res,
                    "Project Deleted Successfully"
                );

                return;
            }

            if (req.auth._id != project.owner.id) {
                RequestHandler.throwError(
                    403,
                    "You Do Not have the Permission to Perform the Action you Requested"
                )();
            }

            await Project.deleteOne({ _id: req.params.projectId });

            RequestHandler.sendSuccess(
                req.requestId,
                res,
                "Project Deleted Successfully"
            );
        } catch (error) {
            console.error(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }
};
