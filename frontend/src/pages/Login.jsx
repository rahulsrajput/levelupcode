import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Code, Mail, Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"


import useAuthStore from "../store/useAuthStore";
import { loginUser } from "../api/authApi"
import LoaderComponent from "../components/Loader"


// 1️⃣ Zod schema
const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().nonempty("Password is required")
})


function Login() {

    const navigate = useNavigate();
    const { setUser, setLoading, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);


    // 2️⃣ useForm with Zod
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema)
    })


    // 3️⃣ Submit handler
    async function onSubmit(data) {
        try {
            setLoading(true)
            const res = await loginUser(data);
            console.log("Login response:", res.data);

            setUser(res.data.user);
            toast.success("Login successful");
            navigate("/");

        } catch (error) {
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                // Loop through fields and show messages
                Object.values(errors).forEach((non_field_errors) => {
                    non_field_errors.forEach((msg) => toast.error(msg));
                });
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
        finally {
            setLoading(false)
        }
    }

    if (loading) return < LoaderComponent /> // Show loader while checking auth

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md text-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8 flex flex-col justify-center max-h-screen">
                    {/* Title */}
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">Login</h2>
                        <Code className="h-6 w-6 text-base-content/40 translate-y-0.5 animate-pulse" />
                    </div>


                    {/* Subtitle */}
                    <div className="text-center mb-6">
                        <p className="text-base-content/60 mt-1">Enter your credentials</p>
                    </div>


                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div className="form-control relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Mail className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="you@example.com"
                                className="input input-bordered pl-10 w-full  text-white relative z-0 border-0"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}


                        {/* Password */}
                        <div className="form-control relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Lock className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="input input-bordered pl-10 w-full text-white relative z-0 border-0"
                                {...register("password")}
                            />

                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-base-content/40" />
                                ) : (
                                    <Eye className="h-5 w-5 text-base-content/40" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mb-4">
                                {errors.password.message}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-black rounded w-full mt-2 hover:scale-105 transition-transform"
                        >
                            Login
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-base-content/60">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Login