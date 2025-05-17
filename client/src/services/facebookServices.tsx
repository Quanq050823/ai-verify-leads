import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { getAccessTokenFromCookie } from "./CookieServices";

interface FacebookPage {
	id: string;
	name: string;
	access_token: string;
	forms?: Array<{
		id: string;
		name: string;
		[key: string]: any;
	}>;
	[key: string]: any;
}

interface FacebookConnection {
	provider: string;
	profile: {
		id: string;
		name: string;
		accessToken: string;
		[key: string]: any;
	};
	pages: FacebookPage[];
	[key: string]: any;
}

interface UserWithConnections {
	_id: string;
	adsConnection: FacebookConnection[];
	[key: string]: any;
}

// Open Facebook Connect popup
export const openFacebookConnect = async () => {
	try {
		// Lấy userId từ cookie hoặc local storage
		const token = await getAccessTokenFromCookie();
		if (!token) {
			toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
			return { error: "Unauthorized", popupWindow: null };
		}

		// Decode JWT để lấy userId
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);

		const { userId } = JSON.parse(jsonPayload);

		// Mở popup để kết nối Facebook
		const popupWindow = window.open(
			`http://localhost:3001/api/facebook/connect/${userId}`,
			"_blank",
			"width=600,height=700"
		);

		return { popupWindow, error: null };
	} catch (error: any) {
		console.error("Error opening Facebook connect popup:", error);
		toast.error(error?.message || "Lỗi khi mở kết nối Facebook");
		return { error, popupWindow: null };
	}
};

// Update Facebook connection
export const updateFacebookConnection = async (profile: any) => {
	try {
		const response = await axios.post("/facebook/connection", { profile });
		toast.success("Facebook connection has been updated");
		return response.data;
	} catch (error: any) {
		console.error("Error updating Facebook connection:", error);
		toast.error(
			error?.response?.data?.message || "Error updating Facebook connection"
		);
		return { error };
	}
};

// Get user's Facebook pages
export const getUserFacebookPages = async (profileId: string) => {
	try {
		const response = await axios.get(`/facebook/pages/${profileId}`);
		return response.data;
	} catch (error: any) {
		console.error("Error getting pages list:", error);
		toast.error(
			error?.response?.data?.message || "Error getting Facebook pages"
		);
		return { error };
	}
};

// Get forms for a Facebook page
export const getFacebookPageForms = async (pageId: string) => {
	try {
		const response = await axios.get(`/facebook/forms/${pageId}`);
		return response.data;
	} catch (error: any) {
		console.error("Error getting forms list:", error);
		toast.error(
			error?.response?.data?.message || "Error getting Facebook forms"
		);
		return { error };
	}
};

// Subscribe a page to webhook
export const subscribePageToWebhook = async (pageId: string) => {
	try {
		const response = await axios.post(`/facebook/subscribePage/${pageId}`);
		return response.data;
	} catch (error: any) {
		console.error("Error subscribing to webhook:", error);
		return { error };
	}
};

// Unsubscribe a page from webhook
export const unsubscribePageFromWebhook = async (
	pageId: string,
	appId: string
) => {
	try {
		const response = await axios.delete(`/facebook/unsubscribePage/${pageId}`, {
			data: { appId },
		});
		toast.success("Đã hủy đăng ký webhook thành công");
		return response.data;
	} catch (error: any) {
		console.error("Error unsubscribing from webhook:", error);
		toast.error(
			error?.response?.data?.message || "Lỗi khi hủy đăng ký webhook"
		);
		return { error };
	}
};

// Hook to get user's Facebook connections
export const useFacebookConnections = (refreshKey?: number) => {
	const [connections, setConnections] = useState<FacebookConnection[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchConnections = async () => {
			try {
				setLoading(true);
				const response = await axios.get("/user/me");
				const user = response.data as UserWithConnections;
				const facebookConnections =
					user.adsConnection?.filter((conn) => conn.provider === "facebook") ||
					[];
				setConnections(facebookConnections);
				setLoading(false);
			} catch (err: any) {
				console.error("Error fetching Facebook connections:", err);
				setError(
					err?.response?.data?.message || "Error fetching Facebook connections"
				);
				setLoading(false);
			}
		};

		fetchConnections();
	}, [refreshKey]);

	return { connections, loading, error };
};

// Hook to get pages for a Facebook connection
export const useFacebookPages = (
	profileId: string | null,
	refreshKey?: number
) => {
	const [pages, setPages] = useState<FacebookPage[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!profileId) return;

		const fetchPages = async () => {
			try {
				setLoading(true);
				const response = await getUserFacebookPages(profileId);
				if (response && !response.error) {
					const userPages =
						response.adsConnection?.find(
							(conn: any) => conn.profile.id === profileId
						)?.pages || [];
					setPages(userPages);
				} else {
					setError("Unable to fetch page list");
				}
				setLoading(false);
			} catch (err: any) {
				console.error("Error fetching Facebook pages:", err);
				setError(
					err?.response?.data?.message || "Error fetching Facebook pages"
				);
				setLoading(false);
			}
		};

		fetchPages();
	}, [profileId, refreshKey]);

	return { pages, loading, error };
};

// Hook to get forms for a Facebook page
export const useFacebookForms = (
	pageId: string | null,
	refreshKey?: number
) => {
	const [forms, setForms] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!pageId) return;

		const fetchForms = async () => {
			try {
				setLoading(true);
				const response = await getFacebookPageForms(pageId);
				if (response && !response.error) {
					const page = response.adsConnection?.[0]?.pages?.find(
						(p: any) => p.id === pageId
					);
					setForms(page?.forms || []);
				} else {
					setError("Unable to fetch form list");
				}
				setLoading(false);
			} catch (err: any) {
				console.error("Error fetching Facebook forms:", err);
				setError(
					err?.response?.data?.message || "Error fetching Facebook forms"
				);
				setLoading(false);
			}
		};

		fetchForms();
	}, [pageId, refreshKey]);

	return { forms, loading, error };
};
