const Joi = require("joi");
const { sign } = require("jsonwebtoken");
const { sysConfig } = require("../../config");
const { Account } = require("../../models/");
const Logger = require("../../Logger");

module.exports = class Register {
    constructor(Logger) {
        this.Logger = Logger;
        this.accountRegistrationSchema = Joi.object({
            firstName: Joi.string().max(50).required(),
            lastName: Joi.string().max(50).required(),
            phoneNumber: Joi.string().max(15).required(),
            email: Joi.string().email(),
            password: Joi.string().min(8).required(),
            passwordConfirmation: Joi.ref("password"),
            biography: Joi.string().empty(""),
        });
    }

    async validate(values) {
        let schema = this.accountRegistrationSchema;

        if (await this.accountExists(values.phoneNumber)) {
            const err = new Error(
                "Account with the phone Number already exists"
            );
            err.status = 400;
            throw err;
        }

        if (values.email && (await this.accountExists(values.email))) {
            const err = new Error("Account with the email already exists");
            err.status = 400;
            throw err;
        }

        const { value: registrationValues, error } = await schema.validate(
            values
        );
        if (error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return registrationValues;
    }

    async accountExists(identifier) {
        const account = await Account.findOne({
            $or: [{ phoneNumber: identifier }, { email: identifier }],
        });

        if (account) {
            return true;
        }

        return false;
    }

    async createAccount(newUserDetails) {
        this.Logger.info("creating user account in Register.createAccount ");

        // if(!sysConfig.MUST_VERIFY_PHONE_NUMBER){
        //     newUserDetails.status = 'active'
        // }

        if (newUserDetails.role == "dealer") {
            newUserDetails.status = "inactive";
        }

        const createdAccount = await new Account(newUserDetails).save();

        return {
            _id: createdAccount._id,
            name: createdAccount.name,
            phoneNumber: createdAccount.phoneNumber,
            email: createdAccount.email,
        };
    }
};
