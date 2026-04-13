import { apiFetch } from "./client";

export const postUserService = {

    /**
     * Create a User Post
     */
    createPost: async ({ title, description, lat, lng, visibility, tags, images }) => {
        const formData = new FormData();

        // Required
        formData.append("title", title);
        formData.append("lat", lat);
        formData.append("lng", lng);
        formData.append("visibility", visibility);

        // Optional
        if (description) {
            formData.append("description", description);
        }

        // Tags
        if (tags?.length) {
            tags.forEach(tag => {
                formData.append("tags[]", tag);
            });
        }

        // Images (required)
        images.forEach(file => {
            formData.append("images[]", file);
        });

        return apiFetch("/post/user/create.php", {
            method: "POST",
            body: formData
        });
    },

    /**
     * Delete a User Post
     */
    deletePost: async ({ postId }) => {
        return apiFetch(`/post/user/delete.php?post_id=${postId}`, {
            method: "DELETE"
        });
    },

    /**
     * Get All User Posts
     */
    getUserPosts: async () => {
        return apiFetch("/post/user/get_user_post.php", {
            method: "GET"
        });
    },

    /**
     * Edit Basic Information of a User Post
     */
    editPostBasic: async ({ postId, title, description, visibility }) => {
        const body = { post_id: postId };
        if (title !== undefined) body.title = title;
        if (description !== undefined) body.description = description;
        if (visibility !== undefined) body.visibility = visibility;
        
        return apiFetch("/post/user/edit_post_basic.php", {
            method: "PATCH",
            body: JSON.stringify(body)
        });
    },

    /**
     * Add a Tag to a User Post
     */
    addPostTag: async ({ postId, newTag }) => {
        const body = new URLSearchParams();
        body.append("post_id", postId);
        body.append("new_tag", newTag);

        return apiFetch("/post/user/add_post_tag.php", {
            method: "POST",
            body
        });
    },

    /**
     * Delete a Tag from a User Post
     */
    deletePostTag: async ({ postId, tagId }) => {
        const body = new URLSearchParams();
        body.append("post_id", postId);
        body.append("tag_id", tagId);

        return apiFetch("/post/user/delete_post_tag.php", {
            method: "POST",
            body
        });
    },

    /**
     * Upload an Image to a User Post
     */
    uploadPostImg: async ({ postId, images }) => {
        const formData = new FormData();
        formData.append("post_id", postId);
        
        if (images && images.length) {
            images.forEach(file => {
                formData.append("images[]", file);
            });
        }

        return apiFetch("/post/user/upload_post_image.php", {
            method: "POST",
            body: formData
        });
    },

    /**
     * Delete an Image from a User Post
     */
    deletePostImg: async ({ postId, imageId }) => {
        const body = new URLSearchParams();
        body.append("post_id", postId);
        body.append("image_id", imageId);

        return apiFetch("/post/user/delete_post_image.php", {
            method: "POST",
            body
        });
    }

}