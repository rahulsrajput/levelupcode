import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { submitProblem, submitProblemStatus } from "../api/problemApi";
import { toast } from "react-hot-toast";
import useProblemStore from "../store/useProblemStore";
import { useParams } from "react-router-dom";
import { Loader2, Dot } from "lucide-react";

function CodeEditor({ problem }) {
    const { languageList } = useProblemStore();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [code, setCode] = useState("");
    const { slug } = useParams();
    const [isSubmitting, setSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [activeTest, setActiveTest] = useState(null);
    console.log("Problem in CodeEditor:", problem);
    console.log("code:", code);
    // Submit problem
    async function submit() {
        setSubmitting(true);
        try {
            const response = await submitProblem({
                problem: slug,
                language: selectedLanguage,
                source_code: code
            });
            const res = await submitProblemStatus(response.data.submission_id);

            if (res.data.testcases) {
                setTestResults(res.data.testcases);
                setActiveTest(0);
            }
        } catch (error) {
            console.error("Error submitting problem:", error.response?.data);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
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
    }, [languageList, problem]);

    // Update code when language changes
    useEffect(() => {
        if (selectedLanguage) {
            setCode(problem.code_snippets[selectedLanguage.toUpperCase()] || "// Write your code here");
        }
    }, [selectedLanguage, problem]);

    return (
        <div className="mt-6 space-y-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
                <label className="text-gray-700 font-mono text-sm">Language:</label>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-sm px-3 py-2 rounded border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus:outline-none"
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
                height="320px"
                defaultLanguage={selectedLanguage.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true
                }}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={submit}
                    disabled={isSubmitting || !selectedLanguage}
                    className={`px-4 py-2 rounded font-mono text-sm transition ${isSubmitting
                            ? "border border-gray-300 cursor-not-allowed text-black"
                            : "border border-gray-300 hover:bg-black hover:text-white text-black"
                        }`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin inline-block w-4 h-4 mr-1" /> : "Submit"}
                </button>
            </div>

            {/* Test Cases */}
            {testResults && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                    <h3 className="font-mono text-gray-800 text-sm">Test Cases</h3>

                    {/* Test case buttons */}
                    <div className="flex flex-wrap gap-2">
                        {testResults.map((tc, idx) => (
                            <button
                                key={tc.id}
                                onClick={() => setActiveTest(idx)}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-mono transition ${activeTest === idx
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                                    }`}
                            >
                                Test {idx + 1}
                                <Dot
                                    className={`w-4 h-4 ${tc.status === "Accepted" ? "text-green-500 fill-green-500" : "text-red-500 fill-red-500"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Test case details */}
                    {activeTest !== null && (
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm space-y-1">
                            <p>
                                <span className="text-indigo-400">Input:</span> {testResults[activeTest].input}
                            </p>
                            <p>
                                <span className="text-indigo-400">Expected:</span> {testResults[activeTest].expected}
                            </p>
                            <p>
                                <span className="text-indigo-400">Output:</span> {testResults[activeTest].stdout || "-"}
                            </p>
                            {testResults[activeTest].stderr && (
                                <p className="text-red-400">Error: {testResults[activeTest].stderr}</p>
                            )}
                            <p>
                                <span className="text-indigo-400">Status:</span> {testResults[activeTest].status}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
