import { apiFetch } from "./client";

export const postExploreService = {

    /**
     * Get explore feed
     * Used for the explore feed list
     */
    getFeed: async () => {
        return apiFetch("/post/explore/get_feed.php", {
            method: "GET"
        });
    },

    /**
     * Get map pins
     * Returns minimal post data for Cesium pins
     */
    getMapPosts: async () => {
        return apiFetch("/post/explore/get_map_posts.php", {
            method: "GET"
        });
    },

    /**
     * Get nearby posts
     * Used to populate the sidebar near the map
     */
    getNearbyPosts: async (lat, lng) => {
        const params = new URLSearchParams({
            lat,
            lng
        });

        return apiFetch(`/post/explore/get_nearby_posts.php?${params}`, {
            method: "GET"
        });
    },

    /**
     * Get full post
     * Used when user opens a post from the map/feed
     */
    getPost: async (postId) => {
        const params = new URLSearchParams({
            post_id: postId
        });

        return apiFetch(`/post/explore/get_post.php?${params}`, {
            method: "GET"
        });
    }

};