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
            enum: [0, 1, 2], //0: deleted, 1: queuing, 2: in-progress
            default: 1,
        },
        leadData: {
            type: mongoose.Schema.Types.Mixed,
        },
        nodeId: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
