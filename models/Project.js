const { Schema, model } = require("mongoose");

const projectSchema = new Schema({
    title: {
        required: true,
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 255,
    },
    owner: {
        name: { type: String, required: true },
        id: { type: String, required: true },
        profileImageURL: { type: String },
    },
    likes: {
        type: [{ type: String }],
        default: [],
    },
    noOfLikes: {
        type: Number,
        default: 0,
    },
    noOfComments: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ["draft", "published"],
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ["Engineering", "Software", "IOT", "Business", "Art", "Other"],
    },
    contactPhoneNumber: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    contactEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    attachments: {
        type: [String],
    },
    link: {
        type: String,
    },
    summary: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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

const Project = model("Project", projectSchema);

module.exports = Project;
