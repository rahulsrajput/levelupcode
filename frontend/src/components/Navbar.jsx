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
            console.log("Error: ", error);
            toast.error(error?.response?.detail || error?.message || "Something went wrong");
        }
    }

    const avatarSrc = user?.profile_url || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">LevelUpCode</Link>
            </div>
            <div className="flex-none">
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="User Avatar"
                                    src={avatarSrc} />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            
                            <li><Link to="/profile" className="justify-between">Profile</Link></li>
                            
                            <li><Link to={'/problemsets/'}>Problems</Link></li>
                            
                            <li><Link >Update Pic</Link></li>
                            
                            <li><Link >AI Credits: 3</Link></li>
                            
                            {user?.is_superuser && (
                                <li><Link to={`${import.meta.env.VITE_BASE_API_URL}/admin`}>Admin</Link></li>
                            )}
                            
                            <li><Link onClick={handleLogout}>Logout</Link></li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="btn btn-ghost">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-ghost">
                            Signup
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
