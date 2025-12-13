import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

import Navbar from './components/Navbar'
import Routes from './routes'
import useAuthStore from './store/useAuthStore'
import { getCurrentUser } from './api/authApi'
import LoaderComponent from './components/Loader'
import Footer from './pages/Footer.jsx'

function App() {

  const { setUser, setLoading, loading, logout } = useAuthStore()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data.data)
      } catch (error) {
        logout();
        toast.error(error.response?.data?.message || error.message);
        toast.error("User is not logged in");
        setLoading(false);
      } finally {
        setLoading(false)
      }
    }

    fetchUser();
  }, [])

  if (loading) return <LoaderComponent />

  return (
    <div
      className="
        min-h-screen w-full overflow-x-hidden
        text-gray-800
        relative
      "
    >

      {/* Global Dotted Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Main App Content */}
      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar />

        <div className="flex-1">
          <Toaster />
          <Routes />
        </div>

        {/* Footer - Stays at bottom */}
        <div className="relative z-10 mt-auto">
          <Footer />
        </div>
      </div>

    </div>
  )
}

export default App
