const { compare } = require("bcryptjs");
const Joi = require("joi");
const { sign, verify } = require("jsonwebtoken");
const { sysConfig } = require("../../config");
const { findOneAndReplace } = require("../../models/Account");
const Logger = require("../../Logger");

module.exports = class Login {
    constructor(Logger) {
        this.validationSchema = Joi.object({
            phoneNumber: Joi.string().max(15).required(),
            password: Joi.string().min(8).required(),
        });

        this.Logger = Logger;
    }

    async validate(values, schema = this.validationSchema) {
        this.Logger.info("validating login details...");
        const { value: loginValues, error } = await schema.validate(values);
        if (error) {
            Logger.error(error);
            const err = new Error(error.details[0].message);
            err.status = 400;
            throw err;
        }

        return loginValues;
    }

    async verifyPassword({ userPassword, databasePassword }) {
        this.Logger.info(
            "verifying user password with database password login details..."
        );
        if (await compare(userPassword, databasePassword)) {
            return { isVerified: true };
        } else {
            return { isVerified: false };
        }
    }

    async createTokens({ _id }) {
        this.Logger.info(
            "creating access and refresh tokens in Login.createTokens ..."
        );

        let refreshTokenExpiry = sysConfig.REFRESH_TOKEN_LIFETIME_IN_SECONDS;
        let accessTokenExpiry = sysConfig.ACCESS_TOKEN_LIFETIME_IN_SECONDS;

        const accessToken = await sign({ _id }, sysConfig.JWT_ACCESS_SECRET, {
            expiresIn: accessTokenExpiry,
        });

        const refreshToken = await sign(
            {
                _id,
                isRefresh: true,
            },
            sysConfig.JWT_REFRESH_SECRET,
            { expiresIn: refreshTokenExpiry }
        );

        return { accessToken, refreshToken };
    }

    async clearExpiredRefreshTokens(refreshTokensArray) {
        let validTokens = [];
        refreshTokensArray.forEach(async (refreshToken) => {
            try {
                const { exp } = await verify(
                    refreshToken,
                    sysConfig.JWT_REFRESH_SECRET
                );
                if (Date.now() / 1000 < exp) {
                    validTokens.push(refreshToken);
                }
            } catch (error) {
                validTokens.push(refreshToken);
            }
        });

        return validTokens;
    }
};
