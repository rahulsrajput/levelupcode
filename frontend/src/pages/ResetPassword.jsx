import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Code, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword, logoutUser } from "../api/authApi";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

// Zod schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data) {
    try {
      await resetPassword({ ...data, token });
      toast.success("Password updated successfully", { duration: 8000 });
      logout();
      await logoutUser();
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
    <div className="flex items-center justify-center min-h-screen px-4 font-sans text-gray-800">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <Code className="h-6 w-6 text-gray-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-sm">Enter your new password</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Password */}
          <div className="relative flex items-center">
            <Lock className="h-5 w-5 text-gray-400 absolute left-2" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="New password"
              className="pl-10 w-full h-10 bg-transparent text-gray-800 placeholder-gray-400 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              className="absolute right-2 flex items-center h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          <p className="text-red-500 text-sm min-h-[1.25rem]">
            {errors.password ? errors.password.message : "\u00A0"}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
