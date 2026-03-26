import { apiFetch } from "./client";

export const postCommentService = {

    /**
     * Create a comment on a user post
     */
    createComment: async ({ postId, comment }) => {
        const formData = new FormData();
        formData.append("post_id", postId);
        formData.append("comment", comment);

        return apiFetch("/post/comment/create_comment.php", {
            method: "POST",
            body: formData
        });
    },

    /**
     * Delete a comment
     */
    deleteComment: async ({ commentId }) => {
        return apiFetch("/post/comment/delete_comment.php", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ comment_id: commentId }).toString()
        });
    },

    /**
     * Get all comments for a post
     */
    getComments: async ({ postId }) => {
        return apiFetch(`/post/comment/get_comments.php?post_id=${postId}`, {
            method: "GET"
        });
    }

};