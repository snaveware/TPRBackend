const { hash } = require("bcryptjs");
const Joi = require("joi");
const { sign, verify } = require("jsonwebtoken");
const { Account } = require("../models/");
const RequestHandler = require("../RequestHandler");
const Logger = require("../Logger");
const { Login, Register } = require("../services/auth");
const { sysConfig, adminPermissions, normalPermissions } = require("../config");
const { createSingleUploadFunction } = require("../services/fileUpload");
const { SMS } = require("../services/sms");

//const docUpload = createSingleUploadFunction("NTSARegistrationCertificate");
const login = new Login(Logger);
const register = new Register(Logger);

module.exports = class AuthController {
    static async login(req, res) {
        Logger.info("Login Controller function: logging user in ...");

        try {
            /**
             * Validate phone and password
             */

            const validated = await login.validate(req.body);

            /**
             * Query user account from database and update lastLogin
             */
            const userAccount = await Account.findOne({
                phoneNumber: validated.phoneNumber,
            });
            if (!userAccount) {
                RequestHandler.throwError(
                    400,
                    "Wrong credentials",
                    "wrong credentials: phoneNumber"
                )();
            } else if (
                sysConfig.MUST_VERIFY_PHONE_NUMBER &&
                !userAccount.isPhoneVerified
            ) {
                RequestHandler.throwError(
                    400,
                    "Please verify your phone number to Login",
                    "phone number is not verified yet it must be verified: suggested phone number verification"
                )();
            } else if (userAccount.status === "disabled") {
                RequestHandler.throwError(
                    400,
                    "Your account has been disabled ",
                    "disabled status"
                )();
            }

            /**
             * Compare passwords
             */
            const { isVerified } = await login.verifyPassword({
                userPassword: validated.password,
                databasePassword: userAccount.password,
            });

            /**
             * If passwords match, create access and refresh tokens and return the tokens
             * Remove expired tokens
             * Then update refresh tokens and  last login
             * Clear expired refresh tokens from database*
             * Else, return an error
             */

            if (isVerified) {
                /**
                 * if two step authentication is off, create tokens and send
                 * if it's on, send verification code and send it back to user
                 */

                const tokens = await login.createTokens({
                    _id: userAccount._id,
                });

                Logger.info(
                    `initiated update for user lastLogin and clearing expired refresh tokens for request: ${req.reqestId}`
                );
                userAccount.lastLogin = new Date();
                userAccount.refreshTokens =
                    await login.clearExpiredRefreshTokens(
                        userAccount.refreshTokens
                    );
                userAccount.refreshTokens.push(tokens.refreshToken);
                await userAccount.save();

                userAccount.password = undefined;
                userAccount.refreshTokens = undefined;
                userAccount.accessLevel = undefined;
                userAccount.permissions = undefined;

                RequestHandler.sendSuccess(
                    res.requestId,
                    res,
                    { tokens, userAccount },
                    200
                );
            } else {
                RequestHandler.throwError(
                    400,
                    "Wrong credentials",
                    "wrong credentials: password"
                )();
            }
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async register(req, res) {
        Logger.info(
            "Register Controller function: registering user account..."
        );

        try {
            /**
             * Validate user details
             */
            let validated = await register.validate(req.body);
            /**
             * Hash password
             */
            const hashedPassword = await hash(validated.password, 10);

            /**
             * Create new user account and save to database
             */
            validated.password = hashedPassword;
            validated.accessLevel = normalPermissions.accessLevel;
            validated.permissions = normalPermissions.permissions;
            validated.role = "normal";

            const createdAccount = await register.createAccount(validated);

            validated._id = createdAccount._id;
            delete validated.password;
            delete validated.passwordConfirmation;
            delete validated.permissions;
            delete validated.accessLevel;

            /**
             * Return created user
             */
            RequestHandler.sendSuccess(req.requestId, res, validated);
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async refreshToken(req, res) {
        Logger.info("Refresh token controller function: refreshing token...");
        try {
            /**
             * Validate refresh token
             */
            const { value: validated, error: validationError } =
                await Joi.object({
                    refreshToken: Joi.string(),
                }).validate(req.body);

            if (validationError) {
                Logger.error(validationError);
                RequestHandler.throwError(400, error.details[0].message)();
            }

            /**
             * Verify token and get userid
             */
            let extracted;
            try {
                extracted = verify(
                    validated.refreshToken,
                    sysConfig.JWT_REFRESH_SECRET
                );
            } catch (error) {
                Logger.error({ requestId: req.requestId, message: error });

                RequestHandler.throwError(401, error.message)();
            }

            if (!extracted) {
                RequestHandler.throwError(
                    500,
                    "an error occurred verifying the token"
                )();
            }

            /**
             * Query the user account
             */

            const userAccount = await Account.findById(extracted._id).exec();
            if (!userAccount) {
                RequestHandler.throwError(404, "User Account Not Found")();
            }
            const {
                _id,
                name,
                role,
                permissions,
                phoneNumber,
                email,
                refreshTokens,
            } = userAccount;

            /**
             * Check if refresh token exists in the database
             */

            if (refreshTokens.indexOf(validated.refreshToken) === -1) {
                RequestHandler.throwError(
                    400,
                    "Invalid Refresh Token, Please Login",
                    "Invalid Refresh token: Refresh Token is not recorded in the database"
                )();
            }

            /**
             * Create new access token
             */
            let refreshTokenExpiry =
                sysConfig.REFRESH_TOKEN_LIFETIME_IN_SECONDS;
            let accessTokenExpiry = sysConfig.ACCESS_TOKEN_LIFETIME_IN_SECONDS;

            const accessToken = await sign(
                {
                    _id,
                },
                sysConfig.JWT_ACCESS_SECRET,
                { expiresIn: accessTokenExpiry }
            );

            /**
             * Adjust refresh token expiry if its less than half of the expiry time
             * IF refresh token has been updated,update the tokens in database
             * Respond with tokens tokens
             */
            if (
                extracted.exp - Date.now() / 1000 <
                0.5 * (extracted.exp - extracted.iat)
            ) {
                const updatedRefreshToken = await sign(
                    {
                        _id,
                        isRefresh: true,
                    },
                    sysConfig.JWT_REFRESH_SECRET,
                    { expiresIn: refreshTokenExpiry }
                );

                userAccount.refreshTokens = login.clearExpiredRefreshTokens(
                    userAccount.refreshTokens
                );
                userAccount.refreshTokens.push(updatedRefreshToken);
                userAccount.save();

                RequestHandler.sendSuccess(
                    req.requestId,
                    res,
                    { accessToken, refreshToken: updatedRefreshToken },
                    200
                );
            } else {
                RequestHandler.sendSuccess(
                    req.requestId,
                    res,
                    { accessToken, refreshToken: validated.refreshToken },
                    200
                );
            }
        } catch (error) {
            console.log(error);
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async sendPhoneCode(req, res) {
        Logger.info(
            "Send phone verification code Controller function : sending verification code..."
        );
        try {
            /**
             * Validate Phone Number
             */

            const { value: validated, error } = await Joi.object({
                phoneNumber: Joi.string().max(15),
            }).validate(req.body);
            if (error) {
                Logger.error(error);
                RequestHandler.throwError(400, error.details[0].message)();
            }

            /**
             * Query the user
             */
            const userAccount = await Account.findOne({
                phoneNumber: validated.phoneNumber,
            }).exec();
            if (!userAccount) {
                RequestHandler.throwError(400, "User Account not found")();
            }

            /**
             * Generate Verification Code
             */
            const verificationCode = Math.floor(Math.random() * 1000000);

            /**
             * Create Verification Token
             */
            const verificationToken = sign(
                { _id: userAccount._id },
                verificationCode.toString(),
                {
                    expiresIn:
                        sysConfig.PHONE_VERIFICATION_CODE_LIFETIME_IN_SECONDS,
                }
            );

            userAccount.otpCode = verificationCode;

            await userAccount.save();

            /**
             * Send verification code
             */

            const sms = new SMS();

            sms.send(validated.phoneNumber, verificationCode);

            /**
             * Return verification token and expiry timestamp
             */
            const expiryDate =
                Date.now() +
                sysConfig.PHONE_VERIFICATION_CODE_LIFETIME_IN_SECONDS * 1000;

            RequestHandler.sendSuccess(req.requestId, res, {
                verificationToken,
                expiryDate,
            });
        } catch (error) {
            RequestHandler.sendError(req.requestId, res, error);
        }
    }

    static async recoverPassword(req, res) {
        try {
            Logger.info("Recover password controller .....");

            /**
             * validate {phoneNumber, code, token, newPassword}
             */
            const { value: validated, error: validationError } =
                await Joi.object({
                    verificationCode: Joi.number().min(6),
                    verificationToken: Joi.string().max(256),
                    newPassword: Joi.string().min(8).required(),
                }).validate(req.body);

            if (validationError) {
                Logger.error(validationError);
                RequestHandler.throwError(
                    400,
                    validationError.details[0].message
                )();
            }

            /**
             * extract token
             */
            let extracted;

            try {
                extracted = verify(
                    validated.verificationToken,
                    validated.verificationCode.toString()
                );
            } catch (error) {
                Logger.error({ requestId: req.requestId, message: error });

                RequestHandler.throwError(401, error.message)();
            }

            if (!extracted) {
                RequestHandler.throwError(
                    500,
                    "an error occurred verifying the token"
                )();
            }

            const userAccount = await Account.findById(extracted._id).exec();

            if (!userAccount) {
                RequestHandler.throwError(400, "user not found")();
            }

            if (userAccount.otpCode !== validated.verificationCode) {
                RequestHandler.throwError(400, "Invalid code")();
            }

            /**
             * Hash password
             */
            const hashedPassword = await hash(validated.newPassword, 10);

            /**
             * change password
             */
            userAccount.otpCode = undefined;
            userAccount.password = hashedPassword;
            userAccount.forcePasswordChange = false;
            await userAccount.save();

            /**
             * Respond with success
             */
            RequestHandler.sendSuccess(
                req.requestHandler,
                res,
                "Password Changed Successfully"
            );
        } catch (error) {
            console.log(error);

            RequestHandler.sendError(req.requestId, res, error);
        }
    }
};
