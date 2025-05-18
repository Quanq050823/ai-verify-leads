"use strict";

import mongoose from "mongoose";

const leadSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        flowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flow",
            required: true,
        },
        status: {
            type: Number,
            default: 1,
        },
        isVerified: {
            status: {
                type: Number,
                enum: [0, 1, 2],
                default: 0,
            },
            message: {
                type: String,
            },
        },
        source: {
            type: String,
        },
        leadData: {
            type: mongoose.Schema.Types.Mixed,
        },
        nodeId: {
            type: mongoose.Schema.Types.Mixed,
        },
        error: {
            status: {
                type: Boolean,
                default: false,
            },
            message: {
                type: String,
            },
            stackTrace: {
                type: String,
            },
            retryCount: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
