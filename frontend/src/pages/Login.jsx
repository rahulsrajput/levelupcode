import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Code, Mail, Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import useAuthStore from "../store/useAuthStore";
import { loginUser } from "../api/authApi";
import LoaderComponent from "../components/Loader";

// Zod schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().nonempty("Password is required")
});

function Login() {
  const navigate = useNavigate();
  const { setUser, setLoading, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data) {
    try {
      setLoading(true);
      const res = await loginUser(data);
      setUser(res.data.user);
      toast.success("Login successful");
      navigate("/");
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(arr =>
          arr.forEach(msg => toast.error(msg))
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoaderComponent />;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 font-sans text-gray-800">
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Login</h2>
            <Code className="h-6 w-6 text-gray-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-sm">Enter your credentials</p>
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

          {/* Password */}
          <div className="relative flex items-center">
            <Lock className="h-5 w-5 text-gray-400 absolute left-2" />
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              className="pl-10 w-full h-10 bg-transparent text-gray-800 placeholder-gray-400 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              className="absolute right-2 flex items-center h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
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
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gray-800 font-medium hover:underline">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
