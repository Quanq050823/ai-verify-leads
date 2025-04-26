import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { toast } from "react-toastify";

// -----------------------------------nodeTypes-----------------------------------

export const fetchAllNodeTypes = async () => {
	try {
		const response = await axios.get("/nodeType");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error("Failed to fetch node types!");
		return { error };
	}
};

export const getNodeTypeById = async (nodeTypeId: string) => {
	try {
		const response = await axios.get(`/nodeType/${nodeTypeId}`);
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error("Failed to fetch node type details!");
		return { error };
	}
};

export const createNodeType = async (nodeTypeData: any) => {
	try {
		const response = await axios.post("/nodeType", nodeTypeData);
		toast.success("Successfully created node type!");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(
			`${error?.response?.data?.message || "Failed to create node type!"}`
		);
		return { error };
	}
};

export const updateNodeType = async (nodeTypeId: string, nodeTypeData: any) => {
	try {
		const response = await axios.put(`/nodeType/${nodeTypeId}`, nodeTypeData);
		toast.success("Successfully updated node type!");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(
			`${error?.response?.data?.message || "Failed to update node type!"}`
		);
		return { error };
	}
};

export const deleteNodeType = async (nodeTypeId: string) => {
	try {
		const response = await axios.delete(`/nodeType/${nodeTypeId}`);
		toast.success("Successfully deleted node type!");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(
			`${error?.response?.data?.message || "Failed to delete node type!"}`
		);
		return { error };
	}
};

export const resetNodeTypeExchange = async () => {
	try {
		const response = await axios.post("/nodeType/resetExchange");
		toast.success("Successfully reset node type exchange!");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(
			`${
				error?.response?.data?.message || "Failed to reset node type exchange!"
			}`
		);
		return { error };
	}
};

// Types
export interface NodeTypeField {
	name: string;
	dataType: "String" | "Number" | "Boolean" | "Date" | "Array" | "Object";
	advanceData?: any;
	isRequired: boolean;
	description?: string;
	_id?: string;
}

export interface NodeType {
	_id?: string;
	name: string;
	key?: string;
	img?: string;
	description?: string;
	fields: NodeTypeField[];
}
