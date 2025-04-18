// utils/facebook.js
export const exchangeLongLivedToken = async (shortToken) => {
    const params = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortToken,
    });

    const res = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params}`);
    if (!res.ok) throw new Error("Failed to exchange token");
    const data = await res.json();

    return data.access_token;
};
