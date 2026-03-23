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
     * TODO AFONSO: Here you instance the Endpoints from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Delete a User Post
     */
    //deletePost:

    /**
     * Get All User Posts
     */
    getUserPosts: async () => {
        return apiFetch("/post/user/get_user_post.php", {
            method: "GET"
        });
    },

    /**
     * TODO AFONSO: Here you instance the Endpoints from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Edit Basic Information of a User Post
     */
    //editPostBasic:

    /**
     * TODO AFONSO: Here you instance the Endpoints from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Add a Tag to a User Post
     */
    //addPostTag:

    /**
     * TODO AFONSO: Here you instance the Endpoints from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Delete a Tag from a User Post
     */
    //deletePostTag:

    /**
     * TODO AFONSO: Here you instance the Endpoints from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Upload an Image to a User Post
     */
    //uploadPostImg:

    /**
     * TODO AFONSO: Here you instance the Endpoints  from the module to consume them in frontend (AFTER IMPLEMENTATION DELETE THIS COMMENT LINE)
     * Delete an Image from a User Post
     */
    //deletePostImg:

}