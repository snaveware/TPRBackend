const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    commenter: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        profileImageURL: { type: String },
    },
    projectId: {
        type: String,
    },
    message: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
