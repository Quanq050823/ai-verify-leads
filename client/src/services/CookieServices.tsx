import unauthAxios from "../utils/unauthAxios.jsx";

export const getAccessTokenFromCookie = async () => {
    let response = await unauthAxios.get("/auth/is-login", { withCredentials: true });
    return response.data.isAuthenticated ? response.data.accessToken : null;
};

export const getRefreshTokenFromCookie = async () => {
    let response = await unauthAxios.get("/auth/is-login", { withCredentials: true });
    return response.data.isAuthenticated ? response.data.refreshToken : null;
};
