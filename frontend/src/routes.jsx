import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import NotFound from "./pages/NotFound";
import SubmissionList from "./pages/SubmissionList";
import SubmissionDetail from "./pages/SubmissionDetail";
import Profile from "./pages/Profile";
import UpdatePassword from "./pages/UpdatePassword";
import ResetPassword from "./pages/ResetPassword";
import useAuthStore from "./store/useAuthStore"


const AppRoutes = () => {

    const {user, isAuthenticated} = useAuthStore()

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={!user ? <Login /> : <Navigate to={"/"}/>} />
            
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to={"/"}/>} />
            
            <Route path="/profile" element={user ? <Profile /> : <Navigate to={"/login"}/>} />
            
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            <Route path="/update-password/" element={<UpdatePassword />} />
            
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/problemsets/" element= {user ? <ProblemList /> : <Navigate to={"/login"}/>} />


            {/* Problem detail with nested routes */}
            <Route path="/problems/:slug/" element={user ? <ProblemDetail /> : <Navigate to={"/login"}/>} >
                
                {/* Submissions list */}
                <Route path="submissions" element={user ? <SubmissionList /> : <Navigate to={"/login"}/>} />
                
                {/* Single submission detail */}
                <Route path="submissions/:id" element={user ? <SubmissionDetail /> : <Navigate to={"/login"}/>} />
                
                {/* Editorial */}
                <Route path="editorial" element={user ? <div /> : <Navigate to={"/login"}/>} /> {/* Just a placeholder; ProblemDetail handles content */}

            </Route>

            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};


export default AppRoutes