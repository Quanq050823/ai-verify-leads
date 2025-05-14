import axios from "axios";

// Tạo instance axios với cấu hình mặc định
const instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Cho phép gửi cookie từ client đến server
});

// Thêm interceptor để xử lý request
instance.interceptors.request.use(
	(config) => {
		// Lấy token từ localStorage nếu có
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Thêm interceptor để xử lý response
instance.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		// Xử lý lỗi 401 Unauthorized - token hết hạn
		if (error.response && error.response.status === 401) {
			localStorage.removeItem("token");
			// Có thể thêm logic để refresh token hoặc chuyển đến trang đăng nhập
		}
		return Promise.reject(error);
	}
);

export default instance;
