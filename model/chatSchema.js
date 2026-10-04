import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        topic: {
            type: String,
            default: "new chat",
        },

        model: {
            type: String,
            required: true,
        },

        summary: {
            type: String,
            default: "",
        },

        summaryUpdatedAt: {
            type: Date,
            default: null,
        },

        summarizedTillMessageNumber: {
            type: Number,
            default: 0,
        },

        messageCount: {
            type: Number,
            default: 0,
        },

        usage: {
            promptTokens: {
                type: Number,
                default: 0,
            },

            completionTokens: {
                type: Number,
                default: 0,
            },

            totalTokens: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

chatSchema.index({
    userId: 1,
    updatedAt: -1,
});

const chat = mongoose.model("chat", chatSchema);

export default chat;