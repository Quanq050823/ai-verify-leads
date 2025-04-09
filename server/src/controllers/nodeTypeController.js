"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as service from "../services/nodeTypeService.js";
import config from "../config/environment.js";

export const getAll = async (req, res, next) => {
    try {
        let result = await service.getAll();
        res.status(StatusCodes.OK).send(result);
    } catch (err) {
        next(err);
    }
};

export const getById = async (req, res, next) => {
    try {
        let result = await service.getById(req.params.nodeTypeId);
        res.status(StatusCodes.OK).send(result);
    } catch (err) {
        next(err);
    }
};

export const createNodeType = async (req, res, next) => {
    try {
        let result = await service.createNodeType(req.body);
        res.status(StatusCodes.CREATED).send(result);
    } catch (err) {
        next(err);
    }
};

export const updateNodeType = async (req, res, next) => {
    try {
        if (req?.file) req.body.img = req?.file;

        let result = await service.updateNodeType(req.params.nodeTypeId, req.body);
        res.status(StatusCodes.OK).send(result);
    } catch (err) {
        next(err);
    }
};

export const deleteNodeType = async (req, res, next) => {
    try {
        let result = await service.deleteNodeType(req.params.nodeTypeId);
        res.status(StatusCodes.OK).send(result);
    } catch (err) {
        next(err);
    }
};

export const resetExchange = async (req, res, next) => {
    try {
        let result = await service.resetExchange();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};
