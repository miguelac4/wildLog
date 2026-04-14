const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const isUrlEncoded = options.body instanceof URLSearchParams;
    const isJsonString = typeof options.body === "string";

    const config = {
        method: options.method || "GET",
        credentials: "include",
        ...options,
        headers: {
            ...(
                isFormData
                    ? {}
                    : isUrlEncoded
                        ? { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
                        : isJsonString
                            ? { "Content-Type": "application/json" }
                            : {}
            ),
            ...(options.headers || {})
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(data?.message || "Erro inesperado.");
        error.status = response.status;
        error.code = data?.code;
        error.request_id = data?.request_id;
        error.data = data;

        throw error;
    }

    return data;
}