import axios from "axios";

export const getLeads = async () => {
	try {
		const response = await axios.get("/lead");
		return response.data;
	} catch (error) {
		console.error("Error fetching leads:", error);
		throw error;
	}
};

export const getLeadById = async (leadId: string) => {
	try {
		const response = await axios.get(`/lead/${leadId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching lead details:", error);
		throw error;
	}
};

export const fetchLeadsByNodes = async (flowId: string) => {
	try {
		const response = await axios.get(`/lead/mergeNodes/${flowId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching leads by nodes:", error);
		throw error;
	}
};

export const retryLead = async (leadId: string) => {
	try {
		const response = await axios.post(`/lead/retry/${leadId}`);
		return response.data;
	} catch (error) {
		console.error("Error retrying lead:", error);
		throw error;
	}
};
