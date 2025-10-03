import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import Navbar from './components/Navbar'
import Routes from './routes'
import useAuthStore from './store/useAuthStore'
import { getCurrentUser } from './api/authApi'
import LoaderComponent from './components/Loader'


function App() {

  const { setUser, setLoading, loading, logout } = useAuthStore()

  useEffect ( function () {
    const fetchUser = async function () {
      try {
        const res = await getCurrentUser();
        console.log("Me response:", res.data);
        setUser(res.data.data)
      } catch (error) {
        logout();
        console.log("No user logged in yet", error);
        toast.error(error.response?.data?.message || error.message);
        toast.error("User is not logged in");
        setLoading(false); // Ensure loading state is updated on error
      }
      finally {
        setLoading(false)
      }
    }

    fetchUser();
  }, [])


  if (loading) return < LoaderComponent /> // Show loader while checking auth

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="flex-1">
        <Toaster />
        <Routes />
      </div>
    </div>
  )
}

export default App
