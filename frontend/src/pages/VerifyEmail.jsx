import React, { useEffect } from "react";
import { verifyEmail } from "../api/authApi";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import LoaderComponent from "../components/Loader";


function VerifyEmail() {

    const { token } = useParams();       // ✅ call hook at top level
    const navigate = useNavigate();
    const {emailVerifyingLoader , setEmailVerifyingLoader} = useAuthStore();

    useEffect(() => {
        async function fetchVerification() {
            setEmailVerifyingLoader(true);
            try {
                await verifyEmail(token);
                // redirect after success
                toast.success("Email verified successfully, You can now login", { duration: 8000 });
                navigate("/login");
            } catch (error) {
                console.error("Email verification failed:", error);
                toast.error(error.response?.data?.serializer_errors.token || error.message, { duration: 8000 });
            }
            finally {
                setEmailVerifyingLoader(false);
            }
        }

        fetchVerification();
    }, []);


    if (emailVerifyingLoader) {
        return (
            <LoaderComponent />
        )
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Verifying..</h2>
            <p className="mb-2">
                Verifying your email please wait.
            </p>
            <p className="text-sm text-gray-400">
                After verification, you will be redirected to login page.
            </p>
        </div>
    );
}


export default VerifyEmail