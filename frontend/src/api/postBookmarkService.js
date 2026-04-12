import { apiFetch } from "./client";

export const postBookmarkService = {
    savePost: async (postId) => {
        const formData = new FormData()
        formData.append("post_id", postId)
        return apiFetch("/post/bookmark/save_post.php", {
            method: "POST",
            body: formData
        })
    },

    unsavePost: async (postId) => {
        return apiFetch("/post/bookmark/unsave_post.php", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ post_id: postId })
        })
    },

    getBookmarks: async () => {
        return apiFetch("/account/get_bookmark.php", {
            method: "GET"
        })
    }
}
