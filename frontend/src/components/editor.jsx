import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { submitProblem, getAllLanguages, submitProblemStatus } from "../api/problemApi";
import { toast } from "react-hot-toast";
import useProblemStore from "../store/useProblemStore";
import { useParams } from "react-router-dom";
import { Loader2 , Dot } from "lucide-react";

function CodeEditor({ problem }) {

    const { languageList, setLanguageList } = useProblemStore();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [code, setCode] = useState("");
    const { slug } = useParams();
    const [isSubmitting, setSubmitting] = useState(false);

    const [testResults, setTestResults] = useState(null);
    const [activeTest, setActiveTest] = useState(null);


    async function submit() {
        setSubmitting(true);
        try {
            const response = await submitProblem({
                problem: slug,
                language: selectedLanguage,
                source_code: code
            })
            const res = await submitProblemStatus(response.data.submission_id)

            if (res.data.testcases) {
                setTestResults(res.data.testcases);
                setActiveTest(0);
            }
        } catch (error) {
            console.log("Error submitting problem:", error.response.data);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        finally {
            setSubmitting(false);
        }
    }


    // Set default language and code once languageList is loaded
    useEffect(() => {
        if (languageList.length > 0 && !selectedLanguage) {
            const defaultLang = languageList[0].name;
            setSelectedLanguage(defaultLang);
            setCode(problem.code_snippets[defaultLang.toUpperCase()] || "// Write your code here");
        }
    }, [languageList]);


    // Update code when user changes language
    useEffect(() => {
        if (selectedLanguage) {
            setCode(problem.code_snippets[selectedLanguage.toUpperCase()] || "// Write your code here");
        }
    }, [selectedLanguage]);


    return (
        <div className="mt-6">
            {/* Language Dropdown */}
            <div className="flex items-center gap-2 mt-4">
                <label className="text-gray-300 font-mono text-sm">Language:</label>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm py-2 rounded hover:bg-black"
                >
                    {languageList.map((lang) => (
                        <option key={lang.name} value={lang.name}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Code Editor */}
            <Editor
                height="300px"
                defaultLanguage={selectedLanguage.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                }}
            />

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={submit}
                    disabled={isSubmitting}
                    className="btn btn-sm  text-green-400 rounded hover:bg-black transition"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>

            {testResults && (
                <div className="mt-6 bg-black/30 rounded-lg">
                    <h3 className="font-mono text-sm mb-3 text-gray-300">Test Cases</h3>

                    {/* Buttons row */}
                    <div className="flex gap-2 mb-4">
                        {testResults.map((tc, idx) => (
                            <button
                                key={tc.id}
                                onClick={() => setActiveTest(idx)}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-mono
                  ${activeTest === idx ? "bg-indigo-900" : "hover:bg-indigo-400/30 cursor-pointer"}`}
                            >
                                Test Case {idx + 1}
                                <Dot
                                    className={`w-6 h-6 ${tc.status === "Accepted"
                                        ? "fill-green-400 text-green-400"
                                        : "fill-red-400 text-red-400"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Selected Test Case Details */}
                    {activeTest !== null && (
                        <div className="bg-[#1e1e1e] p-3 rounded font-mono text-sm space-y-2">
                            <p>
                                <span className="text-indigo-400">Input:</span>{" "}
                                {testResults[activeTest].input}
                            </p>
                            <p>
                                <span className="text-indigo-400">Expected:</span>{" "}
                                {testResults[activeTest].expected}
                            </p>
                            <p>
                                <span className="text-indigo-400">Output:</span>{" "}
                                {testResults[activeTest].stdout || "-"}
                            </p>
                            {testResults[activeTest].stderr && (
                                <p className="text-red-400">
                                    Error: {testResults[activeTest].stderr}
                                </p>
                            )}
                            <p>
                                <span className="text-indigo-400">Status:</span>{" "}
                                {testResults[activeTest].status}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
