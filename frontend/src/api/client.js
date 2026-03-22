const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;

    const config = {
        method: options.method || "GET",
        credentials: "include",
        ...options,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
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