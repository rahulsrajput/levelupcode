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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {},
  });

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Loading profile...</p>;

  const onSubmit = async (data) => {
    try {
      const res = await updateUser(data);
      setUser(res.data.updated_data);
      reset(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const fieldIcons = {
    email: <Mail size={16} className="text-gray-500" />,
    username: <User size={16} className="text-gray-500" />,
    bio: <Info size={16} className="text-gray-500" />,
    role: <Shield size={16} className="text-gray-500" />,
    first_name: <FileText size={16} className="text-gray-500" />,
    last_name: <FileText size={16} className="text-gray-500" />,
    profile_url: <ImageIcon size={16} className="text-gray-500" />,
  };

  return (
    <div className="container mx-auto px-4 mt-6">
      <div className="w-full max-w-5xl bg-gray-250/30 border border-gray-400/25 rounded-xl p-6 mx-auto font-sans text-gray-800 space-y-6">

        {/* Header with Edit / Save / Cancel */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Profile
          </h2>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={handleSubmit(onSubmit)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100/50 hover:bg-gray-200/60 text-gray-800 rounded-md font-medium transition"
              >
                <Save size={16} /> Save
              </button>
            )}
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                reset(user || {});
              }}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100/50 hover:bg-gray-200/60 text-gray-800 rounded-md font-medium transition"
            >
              {isEditing ? <X size={16} /> : <Edit size={16} />}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {["email","username","bio","role","first_name","last_name","profile_url"].map((field) => (
            <div key={field} className="flex items-center gap-3 flex-wrap">
              <div className="flex-shrink-0">{fieldIcons[field]}</div>
              <span className="text-gray-500 w-28 flex-shrink-0 capitalize">{field}:</span>
              {isEditing ? (
                <input
                  type="text"
                  {...register(field)}
                  className="flex-1 bg-white/10 border border-gray-400/30 rounded-md px-2 py-1 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                />
              ) : (
                <span className="flex-1 text-gray-900 truncate">{user?.[field] || `No ${field}`}</span>
              )}
              {errors[field] && (
                <p className="text-red-500 text-sm w-full">{errors[field]?.message}</p>
              )}
            </div>
          ))}
        </form>

        {/* Reset Password */}
        <div>
          <Link
            to="/update-password"
            className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100/50 hover:bg-gray-200/60 rounded-md font-medium transition text-gray-800"
          >
            <KeyRound size={16} /> Reset Password
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Profile;
