const Joi = require("joi");
const { sysConfig } = require("../../config");

module.exports = class Validator {
    static async validateNewProject(projectDetails) {
        const schema = Joi.object({
            title: Joi.string().max(100).min(1).required(),
            category: Joi.string()
                .valid("engineering", "software", "IOT", "business", "art")
                .required(),
            contactPhoneNumber: Joi.string().min(12).max(12).required(),
            contactEmail: Joi.string().min(1).max(255).required(),
            status: Joi.string().valid("draft", "published").required(),
            link: Joi.string().empty(""),
            attachments: Joi.string().empty(""),
            summary: Joi.string().required(),
            description: Joi.string().required(),
        });

        const { value, error } = schema.validate(projectDetails);

        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return value;
    }

    static async validateProjectUpdate(update) {
        const schema = Joi.object({
            title: Joi.string().max(100).min(1).empty(""),
            category: Joi.string()
                .valid("engineering", "software", "IOT", "business", "art")
                .empty(""),
            contactPhoneNumber: Joi.string().min(12).max(12).empty(""),
            contactEmail: Joi.string().min(1).max(255).empty(""),
            status: Joi.string().valid("draft", "published").empty(""),
            link: Joi.string().empty(""),
            attachmentsToRemove: Joi.custom((value, helper) => {
                let valueArray = [];
                if (typeof value == "string") {
                    valueArray = value.split(",");
                } else if (Array.isArray(value)) {
                    valueArray = value;
                    if (value.length > 10) {
                        helper.message({
                            custom: "Attachments Must be less than 10",
                        });
                    }
                }
                return valueArray;
            }),
            attachmentsToAdd: Joi.string().empty(""),
            summary: Joi.string().empty(""),
            description: Joi.string().empty(""),
        });

        const { value, error } = schema.validate(update);

        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return value;
    }

    static async validateGetOptions(options) {
        const schema = Joi.object({
            searchString: Joi.string().empty(""),
            noOfProjectsPerPage: Joi.number()
                .integer()
                .min(2)
                .max(50)
                .empty(""),
            page: Joi.number().integer().min(1).empty(""),
            category: Joi.string()
                .valid("engineering", "software", "IOT", "business", "art")
                .empty(""),
        });

        const { value, error } = schema.validate(options);

        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        if (!value.noOfProjectsPerPage) {
            value.noOfProjectsPerPage = sysConfig.NO_OF_PROJECTS_PER_PAGE;
        }

        if (!value.page) {
            value.page = 1;
        }

        return value;
    }
};
