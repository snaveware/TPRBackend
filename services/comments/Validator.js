const Joi = require("joi");

module.exports = class Validator {
    static async validateNewComment(comment) {
        const schema = Joi.object({
            message: Joi.string().min(2).max(1000).required(),
        });

        const { value, error } = schema.validate(comment);

        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return value;
    }

    static async validateGetOptions(options) {
        const schema = Joi.object({
            page: Joi.number().min(1),
            noOfCommentsPerPage: Joi.number().min(2).max(50),
        });

        const { value, error } = schema.validate(options);

        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return value;
    }
};
