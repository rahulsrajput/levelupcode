import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import { logoutUser } from '../api/authApi'
import toast from 'react-hot-toast'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutUser()
      logout()
      toast.success("Logout successful")
      navigate("/login")
    } catch (error) {
      toast.error(error?.response?.detail || error?.message || "Something went wrong")
    }
  }

  const avatarSrc =
    user?.profile_url ||
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

  return (
    <div className="w-full sticky top-0 z-10 bg-transparent backdrop-blur-none">
      <div className="mx-auto max-w-5xl px-4 flex justify-between items-center h-16">

        {/* Brand */}
        <Link to="/" className="text-xl font-semibold text-gray-800">
          LevelUpCode
        </Link>

        {/* Right Side */}
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={avatarSrc} alt="User Avatar" />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 w-52 p-2 shadow-md 
                     bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200"
            >
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/problemsets">Problems</Link></li>
              <li><button>Update Pic</button></li>
              <li><button disabled className="opacity-70">AI Credits: 3</button></li>
              {user?.is_superuser && (
                <li>
                  <a href={`${import.meta.env.VITE_BASE_API_URL}/admin`} target="_blank">Admin</a>
                </li>
              )}
              <li><button onClick={handleLogout} className="text-red-500">Logout</button></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-sm btn-ghost text-gray-700">Login</Link>
            <Link to="/signup" className="btn btn-sm btn-ghost text-gray-700">Signup</Link>
          </div>
        )}

      </div>
    </div>

  )
}

export default Navbar
