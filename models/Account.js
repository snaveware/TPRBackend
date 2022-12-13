const { Schema, model } = require("mongoose");

const accountSchema = new Schema({
    firstName: {
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
    },
    lastName: {
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
    },
    phoneNumber: {
        required: true,
        unique: true,
        trim: true,
        minlength: 11,
        maxlength: 15,
        type: String,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        maxlength: 50,
    },
    otpCode: {
        type: Number,
    },
    password: {
        required: true,
        type: String,
    },
    role: {
        required: true,
        type: String,
        lowercase: true,
        trim: true,
        default: "normal",
        enum: ["normal", "admin"],
    },
    biography: {
        type: String,
    },
    accessLevel: Number,
    permissions: {
        required: true,
        type: [String],
        default: [],
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "active",
        enum: ["active"],
    },
    profileImage: {
        type: String,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Account = model("Account", accountSchema);

module.exports = Account;
