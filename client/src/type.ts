export type Id = string | number;

// Thông tin lead data chuẩn hóa
export type LeadData = {
	email?: string;
	full_name?: string;
	phone?: string;
	name?: string;
	company_name?: string;
	company?: string;
	job_title?: string;
	position?: string;
	website_link?: string;
	website?: string;
	transcript?: string;
	source?: string;
};

// Định nghĩa trạng thái lead
export enum LeadStatus {
	Error = 0, // Lead bị lỗi
	InProgress = 1, // Lead đang xử lý
	Processing = 2, // Lead đang trong quá trình
	Success = 9, // Lead hoàn thành thành công
}

// Định nghĩa mức độ xác thực lead
export enum LeadVerification {
	None = 0, // Chưa xác thực
	Unqualified = 1, // Không đạt yêu cầu
	Qualified = 2, // Đạt yêu cầu
}

// Định nghĩa loại node
export enum NodeType {
	InProgressLeads = "inProgressLeads",
	QualifiedLeads = "qualifiedLeads",
	UnqualifiedLeads = "unqualifiedLeads",
	DeadLead = "deadLead",
}

// Đối tượng lead đầy đủ
export type Lead = {
	_id: Id;
	userId: string;
	flowId: string;
	source: string;
	status: number;
	isVerified: {
		status: number;
		message?: string;
	};
	leadData: LeadData;
	nodeId: string;
	label?: string;
	nodeBase?: string;
	createdAt: string;
	updatedAt: string;
	error?: {
		status: boolean;
		retryCount: number;
		message?: string;
	};
};

// Nút trong flow
export type Node = {
	id: string;
	type: string;
	label: string;
	leads: Lead[];
};

// Cấu hình hiển thị node
export type NodeDisplay = {
	title: string;
	color: string;
	icon: string;
};

// Column trong lead pipeline
export type Column = {
	id: Id;
	title: string | React.ReactNode;
	type?: string;
	leads?: Lead[];
	nodeType?: string;
	iconColor?: string;
};
