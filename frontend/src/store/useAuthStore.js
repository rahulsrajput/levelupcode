import { create } from "zustand";


const useAuthStore = create(function (set) {
    return {
        user: null,              // will store user object from backend
        isAuthenticated: false,  // whether user is logged in
        loading: true,           // useful when checking auth on app load
        awaitingVerification: false,
        emailVerifyingLoader: false, // for showing loader when verifying email
        

        // Set user when authenticated
        setUser: function (userData) {
            set({
                user: { ...userData }, // spread all fields from backend
                isAuthenticated: true,
                loading: false
            })
        },


        // Logout → clear auth state
        logout: function () {
            set({
                user: null,
                isAuthenticated: false,
                loading: false
            })
        },


        // Only for showing/hiding loader
        setLoading: function (val) {
            set({
                loading: val
            })
        },

        // For showing verification screen after signup
        setAwaitingVerification: function (val) {
            set({
                awaitingVerification: val
            })
        },

        
        // For showing loader when verifying email
        setEmailVerifyingLoader: function (val) {
            set({
                emailVerifyingLoader: val
            })
        },


    }
})

export default useAuthStore