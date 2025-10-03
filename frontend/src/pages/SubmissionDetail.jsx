import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionDetail } from "../api/problemApi";
import useAuthStore from "../store/useAuthStore";
import Editor from "@monaco-editor/react";
import { Sparkles } from "lucide-react"
import LoaderComponent from "../components/Loader";


function SubmissionDetail() {
    const { user } = useAuthStore();
    const { slug, id } = useParams();
    const [submission, setSubmission] = useState(null);

    useEffect(() => {
        async function fetchSubmission() {
            try {
                const res = await getSubmissionDetail(slug, id);
                setSubmission(res.data); // keep res.data as it is
            } catch (error) {
                console.error("Failed to fetch submission:", error);
            }
        }
        fetchSubmission();
    }, [slug, id]);


    if (!submission) {
        return (
            <LoaderComponent />
        );
    }


    return (
        <div className="flex justify-center mt-2">
            <div className="card bg-black/40 backdrop-blur-lg shadow-xl max-w-5xl w-full p-3 rounded-lg text-gray-200">

                {/* Status */}
                <div className="flex items-center mb-2">
                    <span
                        className={`${submission.data.status === "Passed"
                            ? "text-green-400"
                            : submission.data.status === "Failed"
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                    >
                        {submission.data.status}
                        <sup className="ml-1 text-xs text-gray-400">
                            {submission.totalPassedTestCases}/{submission.totalTestCases} testcases passed
                        </sup>
                    </span>
                </div>

                {/* Name + Date */}
                <div className="text-gray-200 text-sm">
                    {user.first_name || "Unknown User"} submitted at{" "}
                    {new Date(
                        submission.data.createdAt || submission.data.created_at
                    ).toLocaleString()}
                </div>

                {/* Language with AI Analyze */}
                <div className="flex justify-between items-center text-xs mb-2 mt-4">
                    <div className="text-gray-400">
                        Code | {submission.data.language}
                    </div>
                    <button
                        onClick={() => alert("AI Analyze coming very soon")}
                        className="flex items-center font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 hover:opacity-80 transition cursor-pointer"
                    >
                        <Sparkles className="inline-block mr-1 text-indigo-400 w-4 h-4 animate-pulse" /> AI Analyze
                    </button>
                </div>

                {/* Submitted Code */}
                <div className="mb-4">
                    <Editor
                        height="300px"
                        defaultLanguage={submission.data.language.toLowerCase()}
                        value={submission.data.source_code}
                        theme="vs-dark"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            wordWrap: "on",
                            scrollbar: { vertical: "auto" },
                        }}
                    />
                </div>

                {/* Failed Test Cases */}
                {submission.failedTestCases?.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold text-gray-300 mb-2">
                            Failed Test Cases
                        </h2>

                        {submission.failedTestCases.map((tc) => (
                            <details
                                key={tc.id}
                                className="mb-3 rounded-lg border border-gray-700 bg-black/30 shadow-md"
                            >
                                <summary className="cursor-pointer px-3 py-2 text-sm text-red-400">
                                    {tc.status} — (Input: {tc.input_data.slice(0, 15)}…)
                                </summary>

                                <div className="p-3 rounded font-mono text-sm space-y-2">
                                    <p className="p-3 rounded bg-[#1e1e1e]">
                                        <span className="text-indigo-400">Input:</span>{" "}
                                        {tc.input_data}
                                    </p>
                                    <p className="p-3 rounded bg-[#1e1e1e]">
                                        <span className="text-indigo-400">Expected:</span>{" "}
                                        {tc.expected_output}
                                    </p>
                                    <p className="p-3 rounded bg-[#1e1e1e]">
                                        <span className="text-indigo-400">Your Output:</span>{" "}
                                        {tc.stdout || tc.actual_output || "-"}
                                    </p>
                                    {tc.stderr && (
                                        <p className="p-3 rounded bg-[#1e1e1e] text-red-400">
                                            Error: {tc.stderr}
                                        </p>
                                    )}
                                    <p className="p-3 rounded bg-[#1e1e1e]">
                                        <span className="text-indigo-400">Status:</span>{" "}
                                        {tc.status}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default SubmissionDetail;
