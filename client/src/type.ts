export type Id = string | number;

export type LeadData = {
	email?: string;
	"full name"?: string;
	phone?: string;
	website_link?: string;
	job_title?: string;
	company_name?: string;
	transcript?: string;
	name?: string;
	source?: string;
	company?: string;
	position?: string;
	website?: string;
};

export type Lead = {
	_id: Id;
	userId: string;
	flowId: string;
	status: number;
	leadData: LeadData;
	nodeId: string;
	createdAt: string;
	updatedAt: string;
	error?: {
		status: boolean;
		retryCount: number;
	};
};

export type Column = {
	id: Id;
	title: string | React.ReactNode;
	leads?: Lead[];
	nodeType?: string;
	iconColor?: string;
};
