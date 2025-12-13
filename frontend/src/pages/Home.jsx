import React from "react";
import { Link } from "react-router-dom";
import { Code2, Rocket, Sparkles, Star } from "lucide-react";

function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-gray-800 bg-transparent">

      {/* Container */}
      <div className="container mx-auto px-4 py-16">

        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Code. Learn. Conquer.
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-base mb-6">
            Practice coding problems, submit solutions, and improve your skills with instant feedback and AI guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/problemsets"
              className="btn btn-sm bg-gray-200 text-gray-800 font-medium border-0 shadow-sm hover:bg-gray-300"
            >
              Start Solving
            </Link>
            <Link
              to="/signup"
              className="btn btn-sm btn-outline border-gray-300 text-gray-800 hover:bg-gray-100"
            >
              Join Free
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto py-16 px-4">
          
          {/* Practice Problems */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <Code2 className="w-8 h-8 text-gray-600 mb-3" />
            <h2 className="text-lg font-semibold mb-1">Practice Problems</h2>
            <p className="text-gray-600 text-sm">Solve clean, daily coding challenges.</p>
          </div>

          {/* Instant Feedback */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <Rocket className="w-8 h-8 text-gray-600 mb-3" />
            <h2 className="text-lg font-semibold mb-1">Instant Feedback</h2>
            <p className="text-gray-600 text-sm">Get immediate results for every submission.</p>
          </div>

          {/* AI Guidance */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Sparkles className="w-6 h-6 mr-2 text-gray-500" />
                <h2 className="text-lg font-semibold">AI Guidance</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Submit code and let AI suggest improvements and optimizations.
              </p>
            </div>
            <Link
              to="/problemsets"
              className="btn btn-sm mt-4 bg-gray-200 text-gray-800 font-medium border-0 shadow-sm hover:bg-gray-300 self-start"
            >
              Try AI Analyze
            </Link>
          </div>
        </section>

        {/* Testimonials / Call to Action */}
        <section className="text-center py-16">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-700 max-w-xl mx-auto text-base mb-6">
            “Minimal, clean, and easy to use. Helps me code every day without distractions.”
          </p>
          <Link
            to="/signup"
            className="btn btn-sm bg-gray-200 text-gray-800 font-medium border-0 shadow-sm hover:bg-gray-300"
          >
            Get Started Free
          </Link>
        </section>

      </div>
    </div>
  );
}

export default Home;
