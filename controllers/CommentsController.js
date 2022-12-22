const RequestHandler = require("../RequestHandler");
const { Comment, Project } = require("../models");
const { Validator } = require("../services/comments");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class commentsController {
    static async getMany(req, res) {
        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid Project id")();
            }

            const validated = await Validator.validateGetOptions(req.query);

            console.log("project id: ", req.params.projectId);
            const options = {
                projectId: req.params.projectId,
            };

            const count = await Comment.countDocuments(options);

            const comments = await Comment.find(options)
                .skip(validated.noOfCommentsPerPage * (validated.page - 1))
                .limit(validated.noOfCommentsPerPage);

            RequestHandler.sendSuccess(req.requestId, res, { count, comments });
        } catch (error) {
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async createOne(req, res) {
        try {
            if (!ObjectId.isValid(req.params.projectId)) {
                RequestHandler.throwError(400, "Invalid id")();
            }

            const project = await Project.findById(req.params.projectId);

            if (!project) {
                RequestHandler.throwError(
                    404,
                    "The project could not be found"
                )();
            }

            const validated = await Validator.validateNewComment(req.body);
            validated.commenter = {
                id: req.auth.id,
                name: `${req.auth.firstName} ${req.auth.lastName}`,
                profileImageURL: req.auth.profileImageURL,
            };

            validated.projectId = req.params.projectId;

            const newComment = new Comment(validated);

            const createdComment = await newComment.save();

            project.noOfComments = project.noOfComments + 1;

            await project.save();

            RequestHandler.sendSuccess(req.requestId, res, createdComment);
        } catch (error) {
            RequestHandler.sendError(req.requestHandler, res, error);
        }
    }
};
