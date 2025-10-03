import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Code } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword, logoutUser } from "../api/authApi";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";


// Zod schema for reset password (only email)
const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});


function ResetPassword() {

    const { token } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuthStore();


    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });


    async function onSubmit(data) {
        try {
            const payload = {
                ...data,
                token: token
            }
            const res = await resetPassword(payload);
            console.log("update password response:", res);
            toast.success("Password updated successfully", { duration: 8000 });
            logout();   // clear any existing auth state
            await logoutUser(); // clear any existing auth state
            navigate("/login");
        } catch (error) {
            const message =
                error.response?.data?.serializer_error?.password ??
                error.response?.data?.serializer_error?.token ??
                error.response?.data?.message ??
                "Something went wrong";
            toast.error(message);
        }
    }




    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md text-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8 flex flex-col justify-center max-h-screen">
                    {/* Title */}
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">Reset Password</h2>
                        <Code className="h-6 w-6 text-base-content/40 translate-y-0.5 animate-pulse" />
                    </div>

                    {/* Subtitle */}
                    <div className="text-center mb-6">
                        <p className="text-base-content/60 mt-1">Enter your updated password</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* password */}
                        <div className="form-control relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Lock className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type="password"
                                {...register("password")}
                                placeholder="abc12@$..."
                                className="input input-bordered pl-10 w-full text-white relative z-0 border-0"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-black rounded w-full mt-2 hover:scale-105 transition-transform"
                        >
                            {isSubmitting ? <span className="loading loading-spinner"></span> : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
