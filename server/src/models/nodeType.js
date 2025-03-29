"use strict";

import mongoose from "mongoose";

const NodeTypeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        key: String,
        img: String,
        description: String,
        fields: [
            {
                name: { type: String, required: true },
                dataType: {
                    type: String,
                    enum: ["String", "Number", "Boolean", "Date", "Array", "Object"],
                    required: true,
                },
                advanceData: mongoose.Schema.Types.Mixed,
                isRequired: {
                    type: Boolean,
                    default: false,
                },
                description: String,
            },
        ],
    },
    { Timestamp: true }
);

const NodeType = mongoose.model("NodeType", NodeTypeSchema);
export default NodeType;
