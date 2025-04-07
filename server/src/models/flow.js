"use strict";

import e from "express";
import mongoose from "mongoose";

const FlowSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: Number,
            enum: [0, 1, 2],
            required: true,
            default: 1,
        },
        nodeData: {
            type: mongoose.Schema.Types.Mixed,
        },
        routeData: {
            type: mongoose.Schema.Types.Mixed,
        },
        lastModified: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Flow = mongoose.model("Flow", FlowSchema);

export default Flow;
