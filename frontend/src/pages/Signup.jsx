import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Code, Mail, Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"


import useAuthStore from "../store/useAuthStore";
import { signupUser } from "../api/authApi"


// 1️⃣ Zod schema
const signupSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().nonempty("Password is required")
})


function Signup() {

    const navigate = useNavigate();
    const { loading, setLoading, awaitingVerification, setAwaitingVerification } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);


    // 2️⃣ useForm with Zod
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signupSchema)
    })


    // 3️⃣ Submit handler
    async function onSubmit(data) {
        try {
            setLoading(true)
            const res = await signupUser(data);
            console.log("Signup response:", res.data);

            toast.success("Signup successful! Check your email to verify your account");
            setAwaitingVerification(true);
        } catch (error) {
            if (error.response?.data?.serializer_errors) {
                const errors = error.response.data.serializer_errors;
                // Loop through fields and show messages
                Object.values(errors).forEach((fieldErrors) => {
                    fieldErrors.forEach((msg) => toast.error(msg));
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

    if (awaitingVerification)
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-center p-6">
                <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                <p className="mb-2">
                    We sent a verification link to your email. Please click it to activate
                    your account.
                </p>
                <p className="text-sm text-gray-400">
                    After verification, you can login from the login page.
                </p>
                <Link className="btn btn-link hover:text-white">Resend</Link>
            </div>
        );

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md text-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8 flex flex-col justify-center max-h-screen">
                    {/* Title */}
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">SignUp</h2>
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
                            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
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
                            <p className="text-red-600 text-sm mb-4">
                                {errors.password.message}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-black rounded w-full mt-2 hover:scale-105 transition-transform"
                        >
                            Signup
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-base-content/60">
                            Have an account?{" "}
                            <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Signup