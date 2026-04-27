import toast from "react-hot-toast";

import type { ProblemDetails } from "../errors/problemDetails.ts";
import { finalUrl } from "../baseUrl.ts";

export const customFetch = {
    fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        const headers = new Headers(init?.headers);
        if (token) headers.set("Authorization", "Bearer " + token);

        const makeRequest = async (): Promise<Response> => {
            const response = await fetch(url, { ...init, headers });

            if (!response.ok) {
                // Handle 401 specifically for token refresh
                if (response.status === 401 && refreshToken) {
                    const refreshResponse = await fetch(`${finalUrl}/RefreshTokens`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken })
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        // Save new tokens
                        localStorage.setItem("accessToken", data.token);
                        localStorage.setItem("refreshToken", data.refreshToken);
                        localStorage.setItem("user", JSON.stringify(data.user));

                        // Update header and retry original request
                        headers.set("Authorization", "Bearer " + data.token);
                        return fetch(url, { ...init, headers });
                    } else {
                        // Refresh token invalid -> logout
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                        return response;
                    }
                }

                // For other errors, show toast
                const errorClone = response.clone();
                try {
                    const problemDetails = (await errorClone.json()) as ProblemDetails;
                    toast.error(problemDetails.title || "An error occurred");
                } catch {
                    toast.error("An error occurred");
                }
            }

            return response;
        };

        return makeRequest();
    }
};