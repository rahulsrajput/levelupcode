import React from "react";
import { Link } from "react-router-dom";
import { Code2, Rocket, Users, Star, Sparkles, Cpu } from "lucide-react";

function Home() {
    return (
        <div className="container mx-auto px-4 mt-6">
            <div className="min-h-screen text-gray-200 font-mono">
                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center text-center py-24 px-6">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400">
                        Code. Learn. Conquer.
                    </h1>
                    <p className="mt-4 text-gray-400 max-w-xl">
                        Practice coding problems, submit solutions, and sharpen your skills
                        with live feedback.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <Link
                            to="/problemsets"
                            className="btn bg-gradient-to-r from-green-400 to-cyan-400 text-black font-semibold border-0 shadow hover:opacity-90"
                        >
                            Start Solving
                        </Link>
                        <Link
                            to="/signup"
                            className="btn btn-outline border-gray-600 hover:border-cyan-400 hover:text-cyan-400"
                        >
                            Join Now
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 py-16">
                    {/* Practice Problems */}
                    <div className="bg-base-200 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <Code2 className="w-8 h-8 text-green-400 mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Practice Problems</h2>
                        <p className="text-gray-400 text-sm">
                            Solve handpicked coding challenges across data structures and algorithms.
                        </p>
                    </div>

                    {/* Instant Feedback */}
                    <div className="bg-base-200 rounded-xl p-6 shadow hover:shadow-lg transition">
                        <Rocket className="w-8 h-8 text-cyan-400 mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Instant Feedback</h2>
                        <p className="text-gray-400 text-sm">
                            Get real-time results with detailed test case breakdowns for every submission.
                        </p>
                    </div>

                    {/* AI Feature Card */}
                    <div className="bg-base-200 rounded-xl p-6 shadow hover:shadow-lg transition flex flex-col justify-between">
                        <div>
                            <div className="flex items-center mb-2">
                                <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                                <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400">
                                    AI Analysis
                                </h2>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Submit code and let AI suggest optimizations, catch errors, and improve readability.
                            </p>
                        </div>
                        <Link
                            to="/problemsets"
                            className="btn btn-sm mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold border-0 shadow hover:opacity-90 self-start"
                        >
                            Try AI Analyze
                        </Link>
                    </div>
                </section>



                {/* Testimonials / Call to Action */}
                <section className="text-center py-16">
                    <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                        “This platform made me love problem-solving again. Super smooth
                        interface and instant results!”
                    </p>
                    <Link
                        to="/signup"
                        className="btn bg-gradient-to-r from-blue-500 to-purple-500 font-semibold shadow hover:opacity-90"
                    >
                        Get Started Free
                    </Link>
                </section>
            </div>
        </div>
    );
}

export default Home;
