"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { uploadBytesResumable } from "firebase/storage";
import * as flowService from "../services/flowService.js";

export const getAll = async (req, res, next) => {
    try {
        let result = await flowService.getFlows(req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req, res, next) => {
    try {
        let result = await flowService.getFlow(req.params.flowId, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const createFlow = async (req, res, next) => {
    try {
        let result = await flowService.createFlow(req.body, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const updateFlow = async (req, res, next) => {
    try {
        let result = await flowService.updateFlow(req.params.flowId, req.body, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const activeFlow = async (req, res, next) => {
    try {
        let result = await flowService.updateStatus(req.params.flowId, 2, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const disableFlow = async (req, res, next) => {
    try {
        let result = await flowService.updateStatus(req.params.flowId, 1, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const deleteFlow = async (req, res, next) => {
    try {
        let result = await flowService.updateStatus(req.params.flowId, 0, req.user);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};
