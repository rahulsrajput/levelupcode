import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Code } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/authApi";


// Zod schema for reset password (only email)
const updatePasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});


function UpdatePassword() {

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });


  async function onSubmit(data) {
    try {
      const res = await forgotPassword(data);
      console.log("forgotPassword response:", res);
      toast.success("Password reset link sent to your email", {duration:8000});
    } catch (error) {
      toast.error(error.response?.data?.message);
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
            <p className="text-base-content/60 mt-1">Enter your email to receive reset link</p>
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
                className="input input-bordered pl-10 w-full text-white relative z-0 border-0"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-black rounded w-full mt-2 hover:scale-105 transition-transform"
            >
              {isSubmitting ? <span className="loading loading-spinner"></span> : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
