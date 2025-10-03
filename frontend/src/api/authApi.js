import axiosInstance from "./axiosInstance";


// Get logged-in user details
const getCurrentUser = async function () {
    const res = await axiosInstance.get("/auth/profile/");
    return res // return user data not other data
}


// Login
const loginUser = async function (data) {
    const res = await axiosInstance.post("/auth/login/", data);
    return res // backend will set access and refresh cookies automatically
}

// Signup
const signupUser = async function (data) {
    const res = await axiosInstance.post("/auth/register/", data);
    return res // backend will set access and refresh cookies automatically
}


// Logout
const logoutUser = async function () {
    const res = await axiosInstance.post("/auth/logout/");
    return res // backend will set access and refresh cookies automatically
}


// Verify Email
const verifyEmail = async function (token) {
    const res = await axiosInstance.post("/auth/verify-email/", {token});
    return res 
}


// Update Password
const forgotPassword = async function (data) {
    const res = await axiosInstance.post("/auth/forgot-password/", data);
    return res 
}


// Update Password
const resetPassword = async function (payload) {
    const res = await axiosInstance.post("/auth/reset-password/", payload);
    return res 
}


// Patch user
const updateUser = async function (data) {
    const res = await axiosInstance.patch("/auth/profile/", data);
    return res // return user data not other data
}


export {
    getCurrentUser,
    loginUser,
    logoutUser,
    signupUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser
}