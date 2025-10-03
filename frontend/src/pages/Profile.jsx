import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  Mail,
  User,
  Info,
  Shield,
  FileText,
  Edit,
  Save,
  X,
  KeyRound,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateUser } from "../api/authApi";



// Zod validation schema
const profileSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  username: z.string().min(2, "Too short").optional(),
  bio: z.string().max(200, "Too long").optional(),
  role: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profile_url: z.string().url().optional(),
});

function Profile() {
  const { user, loading, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {},
  });

  if (loading)
    return <p className="text-center text-gray-400 mt-8">Loading profile...</p>;

  const onSubmit = async (data) => {
    try {
      const res = await updateUser(data);
      console.log("Updated profile:", res.data.updated_data);
      setUser(res.data.updated_data);
      reset(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      const message =
        error.response?.data?.errors?.username ??
        error.response?.data?.errors?.email ??
        error.response?.data?.message ??
        "Something went wrong";
      toast.error(message);
    }

  };

  const fieldIcons = {
    email: <Mail size={16} className="text-indigo-400" />,
    username: <User size={16} className="text-indigo-400" />,
    bio: <Info size={16} className="text-indigo-400" />,
    role: <Shield size={16} className="text-indigo-400" />,
    first_name: <FileText size={16} className="text-indigo-400" />,
    last_name: <FileText size={16} className="text-indigo-400" />,
    profile_url: <ImageIcon size={16} className="text-indigo-400" />,
  };

  return (
    <div className="container mx-auto px-4 mt-6">
      <div className="card bg-black/40 backdrop-blur-lg shadow-xl p-6 font-mono max-w-5xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <FileText size={20} className="text-cyan-400" /> Profile {"{"}
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md"
            >
              <Edit size={16} /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                reset(user || {});
              }}
              className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md">
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {[
            "email",
            "username",
            "bio",
            "role",
            "first_name",
            "last_name",
            "profile_url",
          ].map((field) => (
            <div
              key={field}
              className="flex flex-row flex-wrap items-center gap-2"
            >
              <div className="flex-shrink-0">{fieldIcons[field]}</div>
              <span className="text-indigo-400 w-28 flex-shrink-0">
                {field}:
              </span>

              {isEditing ? (
                <input
                  type="text"
                  {...register(field)}
                  className="input input-sm flex-1 bg-white/5 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md break-words"
                />
              ) : (
                <span
                  className="text-emerald-400 break-words flex-1 max-w-full"
                  title={user?.[field] || ""}
                >
                  {user?.[field] || `No ${field} yet`}
                </span>

              )}

              {errors[field] && (
                <p className="text-red-400 text-sm w-full">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}

          <h2 className="font-bold text-gray-200 mt-2">{"}"}</h2>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md"
              >
                <Save size={16} /> Save
              </button>
              <button
                type="button"
                className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md"
                onClick={() => {
                  setIsEditing(false);
                  reset(user || {});
                }}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </form>

        <div className="mt-6">
          <Link
            to="/update-password"
            className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md">
            <KeyRound size={16} /> Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
