import { apiFetch } from "./client";

export const accountService = {
    updateProfile: async (name, description) => {
        return apiFetch("/account/edit_account_info.php", {
            method: "POST",
            body: JSON.stringify({
                name,
                description
            })
        });
    },
    getProfile: async () => {
        return apiFetch("/account/get_account.php", {
            method: "GET"
        });
    }
};
