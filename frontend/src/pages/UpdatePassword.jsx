import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Code } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/authApi";

// Zod schema
const updatePasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

function UpdatePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });

  async function onSubmit(data) {
    try {
      await forgotPassword(data);
      toast.success("Password reset link sent to your email", { duration: 8000 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 font-sans text-gray-800">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <Code className="h-6 w-6 text-gray-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-sm">Enter your email to receive a reset link</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className="relative flex items-center">
            <Mail className="h-5 w-5 text-gray-400 absolute left-2" />
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className="pl-10 w-full h-10 bg-transparent text-gray-800 placeholder-gray-400 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <p className="text-red-500 text-sm min-h-[1.25rem]">
            {errors.email ? errors.email.message : "\u00A0"}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
