"use strict";

import mongoose from "mongoose";

const leadSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: Number,
            enum: [0, 1, 2],
            default: 1,
        },
        leadData: {
            type: mongoose.Schema.Types.Mixed,
        },
        currentNode: {
            type: mongoose.Schema.Types.Mixed,
        },
        createdDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
