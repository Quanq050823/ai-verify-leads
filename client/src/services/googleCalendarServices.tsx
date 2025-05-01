import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { getAccessTokenFromCookie } from "./CookieServices";

interface GoogleCalendarConnection {
	provider: string;
	profile: {
		id: string;
		name: string;
		email: string;
		accessToken: string;
		[key: string]: any;
	};
	tokens: {
		access_token: string;
		refresh_token: string;
		[key: string]: any;
	};
	[key: string]: any;
}

interface UserWithConnections {
	_id: string;
	calendarConnection: GoogleCalendarConnection[];
	[key: string]: any;
}

// Open Google Calendar Connect popup
export const openGoogleCalendarConnect = async () => {
	try {
		// Lấy JWT token từ cookie
		const token = await getAccessTokenFromCookie();
		if (!token) {
			toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
			return { error: "Unauthorized", popupWindow: null };
		}

		// Gọi API để lấy URL xác thực từ backend
		// Server sẽ tự động lấy userId từ token JWT trong header của request
		const response = await axios.get("/calendar/getUrl");

		if (!response.data || !response.data.url) {
			throw new Error("Không thể lấy được URL xác thực");
		}

		// Mở popup với URL đã nhận từ server
		const popupWindow = window.open(
			response.data.url,
			"_blank",
			"width=600,height=700"
		);

		return { popupWindow, error: null };
	} catch (error: any) {
		console.error("Error opening Google Calendar connect popup:", error);
		toast.error(
			error?.message ||
				error?.response?.data?.message ||
				"Lỗi khi mở kết nối Google Calendar"
		);
		return { error, popupWindow: null };
	}
};

// Hook to get user's Google Calendar connections
export const useGoogleCalendarConnections = (refreshKey?: number) => {
	const [connections, setConnections] = useState<GoogleCalendarConnection[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchConnections = async () => {
			try {
				setLoading(true);
				const response = await axios.get("/user/me");
				const user = response.data as UserWithConnections;
				const calendarConnections =
					user.calendarConnection?.filter(
						(conn) => conn.provider === "google"
					) || [];
				setConnections(calendarConnections);
				setLoading(false);
			} catch (err: any) {
				console.error("Error fetching Google Calendar connections:", err);
				setError(
					err?.response?.data?.message ||
						"Error fetching Google Calendar connections"
				);
				setLoading(false);
			}
		};

		fetchConnections();
	}, [refreshKey]);

	return { connections, loading, error };
};
