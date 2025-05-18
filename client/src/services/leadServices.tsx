import apiClient from "@/utils/axios.jsx";
import { toast } from "react-toastify";
import { Lead } from "../type";

// -----------------------------------leads-----------------------------------

export const fetchAllLeads = async () => {
	try {
		const response = await apiClient.get("/lead");
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error("Failed to fetch leads!");
		return { error };
	}
};

export const fetchLeadById = async (leadId: string) => {
	try {
		const response = await apiClient.get(`/lead/${leadId}`);
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(`${error?.response?.data?.message || "Failed to fetch lead!"}`);
		return { error };
	}
};

export const fetchLeadsByNodes = async (flowId: string) => {
	try {
		const response = await apiClient.get(`/lead/mergeNodes/${flowId}`);
		return response.data;
	} catch (error: any) {
		console.log(error);
		toast.error(
			`${error?.response?.data?.message || "Failed to fetch leads by nodes!"}`
		);
		return { error };
	}
};

// Lấy tất cả leads, có thể lọc theo flowId
export const getLeads = async (flowId?: string): Promise<Lead[]> => {
	try {
		let url = "/lead";

		// Nếu flowId được cung cấp, sử dụng endpoint để lấy lead theo flow
		if (flowId) {
			url = `/lead/flow/${flowId}`;
		}

		const response = await apiClient.get(url);
		return response.data;
	} catch (error) {
		console.error("Error fetching leads:", error);
		toast.error("Failed to fetch leads!");
		return [];
	}
};

// Lấy chi tiết lead theo ID
export const getLeadById = async (id: string): Promise<Lead | null> => {
	try {
		const response = await apiClient.get(`/lead/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching lead with ID ${id}:`, error);
		toast.error(`Failed to fetch lead with ID ${id}!`);
		return null;
	}
};

// Cập nhật lead
export const updateLead = async (
	id: string,
	leadData: Partial<Lead>
): Promise<Lead | null> => {
	try {
		const response = await apiClient.put(`/lead/${id}`, leadData);
		return response.data;
	} catch (error) {
		console.error(`Error updating lead with ID ${id}:`, error);
		toast.error(`Failed to update lead!`);
		return null;
	}
};

// Tạo lead mới
export const createLead = async (
	leadData: Partial<Lead>
): Promise<Lead | null> => {
	try {
		const response = await apiClient.post("/lead", leadData);
		return response.data;
	} catch (error) {
		console.error("Error creating new lead:", error);
		toast.error("Failed to create new lead!");
		return null;
	}
};

// Xóa lead
export const deleteLead = async (id: string): Promise<boolean> => {
	try {
		await apiClient.delete(`/lead/${id}`);
		toast.success("Lead deleted successfully!");
		return true;
	} catch (error) {
		console.error(`Error deleting lead with ID ${id}:`, error);
		toast.error("Failed to delete lead!");
		return false;
	}
};

// Retry lead processing
export const retryLead = async (id: string): Promise<boolean> => {
	try {
		await apiClient.post(`/lead/retry/${id}`);
		toast.success("Lead processing restarted!");
		return true;
	} catch (error) {
		console.error(`Error retrying lead with ID ${id}:`, error);
		toast.error("Failed to retry lead processing!");
		return false;
	}
};
