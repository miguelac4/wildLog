import { apiFetch } from "./client";

export const authService = {

    register: async (username, email, password) => {
        return apiFetch("/auth/register.php", {
            method: "POST",
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
    },

    login: async (email, password) => {
        return apiFetch("/auth/login.php", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });
    },

    logout: async () => {
        return apiFetch("/auth/logout.php", {
            method: "POST"
        });
    },

    me: async () => {
        return apiFetch("/auth/me.php", {
            method: "GET"
        });
    },

    resendVerification: async (email) => {
        return apiFetch("/auth/verification_mail.php", {
            method: "POST",
            body: JSON.stringify({ email })
        });
    },

    requestPasswordReset: async (email) => {
        return apiFetch("/auth/pass_recover_request.php", {
            method: "POST",
            body: JSON.stringify({ email })
        });
    },

    resetPassword: async (token, new_password, confirm_password) => {
        return apiFetch("/auth/pass_recover_reset.php", {
            method: "POST",
            body: JSON.stringify({
                token,
                new_password,
                confirm_password
            })
        });
    }

};