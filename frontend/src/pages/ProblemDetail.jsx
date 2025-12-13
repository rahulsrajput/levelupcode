import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { getProblemBySlug, getProblemSubmissionsByUser, getAllLanguages } from "../api/problemApi";
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
            } catch (error) {
                toast.error(error.response?.message || "Something went wrong");
            }
        }
        fetchLanguages();
    }, []);

    // Fetch problem and user submissions
    useEffect(() => {
        async function fetchProblem() {
            try {
                const res = await getProblemBySlug(slug);
                setProblem(res.data.data);
            } catch (err) {
                toast.error("Failed to load problem");
            }
        }

        async function fetchSubmissions() {
            try {
                const res = await getProblemSubmissionsByUser(slug);
                setSubmissions(res.data.data || []);
            } catch (err) {
                toast.error("Failed to load submissions");
            }
        }

        fetchProblem();
        fetchSubmissions();
    }, [slug]);

    // Set active tab from URL
    useEffect(() => {
        if (location.pathname.includes("submissions")) setActiveTab("submissions");
        else if (location.pathname.includes("editorial")) setActiveTab("editorial");
        else setActiveTab("description");
    }, [location.pathname]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === "submissions") navigate(`submissions`);
        else if (tab === "editorial") navigate(`editorial`);
        else navigate("");
    };

    if (!problem) return <div className="flex justify-center items-center min-h-screen"><LoaderComponent /></div>;

    return (
        <div className="flex justify-center px-4 pt-6 font-sans text-gray-800">
            <div className="w-full max-w-5xl bg-gray-250/30 border border-gray-400/25 rounded-xl p-6 mx-auto font-sans text-gray-800 space-y-6">

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 text-center">{problem.title}</h1>

                {/* Tabs */}
                <div className="flex justify-center gap-1 border-b-1 border-gray-300">
                    {["description", "submissions", "editorial"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`pb-2 px-3 text-sm font-mono capitalize transition ${activeTab === tab
                                    ? "border-b-2 border-indigo-500 text-gray-900 font-semibold"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === "description" && (
                    <div className="space-y-6">

                        {/* Difficulty */}
                        <div>
                            <span className={`font-semibold ${problem.difficulty === "Easy"
                                    ? "text-emerald-600"
                                    : problem.difficulty === "Medium"
                                        ? "text-amber-600"
                                        : "text-rose-600"
                                }`}>
                                {problem.difficulty}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {problem.description}
                        </div>

                        {/* Examples */}
                        {problem.examples && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Examples:</h3>
                                {Object.entries(problem.examples).map(([lang, ex], idx) => (
                                    <div key={idx} className="bg-white/20 p-3 rounded-md">
                                        <p className="text-sm font-mono text-indigo-500">Example {idx + 1} ({lang})</p>
                                        <p className="text-sm"><span className="font-mono">Input:</span> {ex.input}</p>
                                        <p className="text-sm"><span className="font-mono">Output:</span> {ex.output}</p>
                                        {ex.explanation && <p className="text-sm text-gray-600"><span className="font-mono">Explanation:</span> {ex.explanation}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Constraints */}
                        {problem.constraints && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Constraints</h3>
                                <p className="text-gray-700 whitespace-pre-line">{problem.constraints}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {problem.tags && (
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-200/50 text-gray-800 text-xs rounded-full font-mono">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Code Editor */}
                        <CodeEditor problem={problem} />

                    </div>
                )}

                {activeTab === "submissions" && <Outlet context={{ submissions }} />}

                {activeTab === "editorial" && (
                    problem.editorial ? (
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">{problem.editorial}</div>
                    ) : (
                        <p className="text-gray-500 italic">No editorial available for this problem.</p>
                    )
                )}

            </div>
        </div>
    );
}

export default ProblemDetail;
