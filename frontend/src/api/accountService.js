import { apiFetch } from "./client";

export const accountService = {
    changePassword: async (curr_password, new_password, confirm_password) => {
        return apiFetch("/account/change_password.php", {
            method: "POST",
            body: JSON.stringify({
                curr_password,
                new_password,
                confirm_password
            })
        });
    },
    deleteAccount: async (password, confirm_text) => {
        return apiFetch("/account/delete_account.php", {
            method: "DELETE",
            body: JSON.stringify({
                password,
                confirm_text
            })
        });
    },
    editAccountInfo: async (name, description) => {
        return apiFetch("/account/edit_account_info.php", {
            method: "POST",
            body: JSON.stringify({
                name,
                description
            })
        });
    },
    editAvatar: async (avatar) => {
        const formData = new FormData();
        formData.append("avatar", avatar);

        return apiFetch("/account/edit_avatar.php", {
            method: "POST",
            body: formData
        });
    },
    getAccount: async () => {
        return apiFetch("/account/get_account.php", {
            method: "GET"
        });
    },
    getBookmark: async () => {
        return apiFetch("/account/get_bookmark.php", {
            method: "GET"
        });
    }
};
