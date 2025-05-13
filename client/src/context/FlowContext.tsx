"use client";
import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	ReactNode,
} from "react";

interface FlowContextProps {
	selectedFlowId: string | null;
	setSelectedFlowId: (id: string | null) => void;
}

const FlowContext = createContext<FlowContextProps | undefined>(undefined);

interface FlowProviderProps {
	children: ReactNode;
}

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
	const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

	// Khôi phục flowId từ localStorage khi component được khởi tạo
	useEffect(() => {
		const storedFlowId = localStorage.getItem("selectedFlowId");
		if (storedFlowId) {
			setSelectedFlowId(storedFlowId);
		}
	}, []);

	// Lưu flowId vào localStorage khi thay đổi
	useEffect(() => {
		if (selectedFlowId) {
			localStorage.setItem("selectedFlowId", selectedFlowId);
		} else {
			localStorage.removeItem("selectedFlowId");
		}
	}, [selectedFlowId]);

	return (
		<FlowContext.Provider value={{ selectedFlowId, setSelectedFlowId }}>
			{children}
		</FlowContext.Provider>
	);
};

// Hook để sử dụng FlowContext
export const useFlow = (): FlowContextProps => {
	const context = useContext(FlowContext);
	if (context === undefined) {
		throw new Error("useFlow must be used within a FlowProvider");
	}
	return context;
};
