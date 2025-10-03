import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // include cookies when making requests
})


// 1-  Request Interceptor - Axios Middleware: we can modify the request before sending it to the backend and send it to the backend

axiosInstance.interceptors.request.use(
    function (request) {
        // 👉 Before request is sent
        // Example: add headers if needed
        return request
    },
    function (error) {
        // 👉 If request fails before reaching backend
        return Promise.reject(error);
    }
)



// 2. Response Interceptor - Axios Middleware: we can modify the response which we get from the backend and send it to the frontend
axiosInstance.interceptors.response.use(
    function (response) {
        // 👉 Successful response (2xx)
        // Directly return it so frontend gets data
        return response
    },

    async function (error) {
        // 👉 Error response (4xx or 5xx)
        var originalRequest = error.config;

        // 👉 Prevent infinite loop (use `_retry` flag)
        if (error.response && error.response.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 👉 1. Call refresh API
                await axiosInstance.post("/auth/refresh/");

                // 👉 2. Retry the original request (now cookies are updated)
                return axiosInstance(originalRequest);
            } catch (error) {
                // 👉 If refresh also fails → logout user or redirect
                return Promise.reject(error);
            }

        }
        // 👉 Other errors → reject
        return Promise.reject(error);
    }
)

export default axiosInstance;