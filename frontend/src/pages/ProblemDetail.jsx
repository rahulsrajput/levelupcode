import React from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProblemBySlug, getProblemSubmissionsByUser, getAllLanguages } from "../api/problemApi"; // implement this
import toast from "react-hot-toast";
import CodeEditor from "../components/editor";
import useProblemStore from "../store/useProblemStore";
import LoaderComponent from "../components/Loader";


function ProblemDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [problem, setProblem] = useState(null);
    const [activeTab, setActiveTab] = useState("description");
    const [submissions, setSubmissions] = useState([]);
    const { setLanguageList } = useProblemStore();

    
    // Fetch available languages
    useEffect(() => {
        async function fetchLanguages() {
            try {
                const res = await getAllLanguages();
                setLanguageList(res.data.data);
                toast.success("Languages fetched successfully");
            } catch (error) {
                toast.error(error.response?.message || "Something went wrong");
            }
        }
        fetchLanguages();
    }, []);


    useEffect(() => {
        async function fetchProblem() {
            try {
                const res = await getProblemBySlug(slug);
                setProblem(res.data.data);
            } catch (err) {
                console.error("Error fetching problem:", err);
                toast.error("Failed to load problem");
            }
        }

        async function fetchSubmissions() {
            try {
                const res = await getProblemSubmissionsByUser(slug);
                setSubmissions(res.data.data || []);
            } catch (err) {
                console.error("Error fetching submissions:", err);
                toast.error("Failed to load submissions");
            }
        }

        fetchSubmissions();
        fetchProblem();
    }, [slug]);


    // Update tab based on URL
    useEffect(() => {
        if (location.pathname.includes("submissions")) setActiveTab("submissions");
        else if (location.pathname.includes("editorial")) setActiveTab("editorial");
        else setActiveTab("description");
    }, [location.pathname]);


    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === "submissions") navigate(`submissions`);
        else if (tab === "editorial") navigate(`editorial`); // optional
        else navigate(""); // back to description
    };


    if (!problem) {
        return (
            <LoaderComponent />
        );
    }

    return (
        <div className="container mx-auto px-4 mt-6">
            <div className="card bg-black/40 backdrop-blur-lg shadow-xl p-6 max-w-5xl mx-auto rounded-lg text-gray-200">
                {/* Title */}
                <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b border-gray-700">
                    {["description", "submissions", "editorial"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`pb-2 px-1 font-mono text-sm capitalize cursor-pointer ${activeTab === tab
                                ? "border-b-2 border-indigo-400 text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>



                {/* Content */}
                {activeTab === "description" && (
                    <div>
                        {/* Difficulty */}
                        <div className="mb-4">
                            <span
                                className={`font-semibold ${problem.difficulty === "Easy"
                                    ? "text-green-400"
                                    : problem.difficulty === "Medium"
                                        ? "text-yellow-400"
                                        : "text-red-400"
                                    }`}
                            >
                                {problem.difficulty}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="mb-6 whitespace-pre-line text-gray-300 leading-relaxed">
                            {problem.description}
                        </div>

                        {/* Examples */}
                        {problem.examples && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Examples :</h3>
                                <div className="space-y-4">
                                    {Object.entries(problem.examples).map(([lang, ex], idx) => (
                                        <div
                                            key={idx}
                                            className="bg-black/30 p-3 rounded-lg"
                                        >
                                            <p className="text-sm">
                                                <span className="font-mono text-indigo-400">Example:</span>{" "}
                                                {idx + 1}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-mono text-indigo-400">Language:</span>{" "}
                                                {lang}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-mono text-indigo-400">Input:</span>{" "}
                                                {ex.input}
                                            </p>
                                            <p className="text-sm">
                                                <span className="font-mono text-indigo-400">Output:</span>{" "}
                                                {ex.output}
                                            </p>
                                            {ex.explanation && (
                                                <p className="text-sm text-gray-400 mt-1">
                                                    <span className="font-mono">Explanation:</span>{" "}
                                                    {ex.explanation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Constraints */}
                        {problem.constraints && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                                <p className="text-gray-300 whitespace-pre-line">
                                    {problem.constraints}
                                </p>
                            </div>
                        )}

                        {/* Tags */}
                        {problem.tags && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {problem.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-3 py-1 bg-gray-700 rounded-full font-mono"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}


                        <CodeEditor problem={problem} />
                    </div>
                )}

                {activeTab === "submissions" && (
                    // Outlet will switch between SubmissionList and SubmissionDetail
                    <Outlet context={{ submissions }} />
                )}

                {activeTab === "editorial" && (
                    problem.editorial ? (
                        <div className="whitespace-pre-line text-gray-300 leading-relaxed">
                            {problem.editorial}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">
                            No editorial available for this problem.
                        </p>
                    )
                )}
            </div>
        </div>
    );
}


export default ProblemDetail