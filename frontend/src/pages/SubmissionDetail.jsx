import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionDetail } from "../api/problemApi";
import useAuthStore from "../store/useAuthStore";
import Editor from "@monaco-editor/react";
import { 
    Sparkles, 
    CheckCircle, 
    XCircle, 
    Clock, 
    ChevronRight, 
    Terminal, 
    User, 
    Loader2, 
    Bot,
    AlertCircle
} from "lucide-react";
import LoaderComponent from "../components/Loader";

function SubmissionDetail() {
    const { user } = useAuthStore();
    const { slug, id } = useParams();
    const [submission, setSubmission] = useState(null);
    
    // AI State
    const [showAi, setShowAi] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");

    useEffect(() => {
        async function fetchSubmission() {
            try {
                const res = await getSubmissionDetail(slug, id);
                setSubmission(res.data);
            } catch (error) {
                console.error("Failed to fetch submission:", error);
            }
        }
        fetchSubmission();
    }, [slug, id]);

    // Handle AI Click
    const handleAiAnalyze = () => {
        if (showAi && aiFeedback) {
            setShowAi(false); // Toggle off if already showing
            return;
        }

        setShowAi(true);
        setAiLoading(true);

        // TODO: Replace this with your actual AI API call
        setTimeout(() => {
            setAiFeedback(`Here is a quick analysis of your ${submission.data.language} code:\n\n1. **Time Complexity**: The solution appears to be O(n) which is optimal for this problem constraints.\n2. **Readability**: Variable names are clear, but you could extract the validation logic into a separate helper function.\n3. **Edge Cases**: Good job handling the null input case, but check if the array is empty before accessing index 0.`);
            setAiLoading(false);
        }, 2000);
    };

    if (!submission) return <LoaderComponent />;

    // --- Status Logic ---
    const getStatusConfig = (status) => {
        switch (status) {
            case "Passed":
                return {
                    color: "text-success",
                    bg: "bg-success",
                    ring: "ring-success/20",
                    icon: CheckCircle,
                    label: "Passed"
                };
            case "Pending":
                return {
                    color: "text-warning",
                    bg: "bg-warning",
                    ring: "ring-warning/20",
                    icon: Loader2,
                    label: "Pending",
                    animate: true
                };
            default: // Failed or Error
                return {
                    color: "text-error",
                    bg: "bg-error",
                    ring: "ring-error/20",
                    icon: XCircle,
                    label: "Failed"
                };
        }
    };

    const statusStyle = getStatusConfig(submission.data.status);
    const StatusIcon = statusStyle.icon;

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-6">
                <div>
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${statusStyle.bg}/10 ${statusStyle.color}`}>
                            <StatusIcon className={`w-6 h-6 ${statusStyle.animate ? "animate-spin" : ""}`} />
                        </div>
                        <h1 className={`text-3xl font-bold tracking-tight ${statusStyle.color}`}>
                            {submission.data.status}
                        </h1>
                    </div>
                    
                    {/* Test Cases Text */}
                    <p className="text-base-content/60 font-medium ml-1">
                        Passed <span className="text-base-content font-bold">{submission.totalPassedTestCases}</span> of <span className="text-base-content font-bold">{submission.totalTestCases}</span> test cases
                    </p>
                </div>

                {/* User Meta */}
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-base-content/80 bg-base-200/50 px-3 py-1.5 rounded-full">
                        <User className="w-3.5 h-3.5 opacity-60" />
                        <span className="font-semibold">{user ? user.email : "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-base-content/40 px-2">
                        <Clock className="w-3 h-3" />
                        {new Date(submission.data.createdAt || submission.data.created_at).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* --- CODE EDITOR SECTION --- */}
            <div className="space-y-4">
                
                {/* Editor Header + AI Button */}
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Source Code
                    </h2>
                    
                    {/* Clean AI Button (Violet/Indigo Theme) */}
                    <button
                        onClick={handleAiAnalyze}
                        className={`
                            group flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm
                            ${showAi 
                                ? "bg-violet-600 text-white border-violet-600 shadow-violet-200" 
                                : "bg-white text-base-content/60 border-base-300 hover:border-violet-400 hover:text-violet-600 hover:shadow-md"
                            }
                        `}
                    >
                        <Sparkles className={"w-3.5 h-3.5"} /> 
                        {showAi ? "Close Analysis" : "AI Analyze"}
                    </button>
                </div>

                {/* Editor Container */}
                <div className="border border-base-300 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <Editor
                        height="400px"
                        defaultLanguage={submission.data.language.toLowerCase()}
                        value={submission.data.source_code}
                        theme="light"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            renderLineHighlight: "none",
                            fontFamily: "'Fira Code', monospace",
                            padding: { top: 20, bottom: 20 }
                        }}
                    />
                </div>
                <div className="flex justify-end px-2">
                     <span className="text-[10px] font-mono uppercase text-base-content/30 tracking-widest">
                        Language: {submission.data.language}
                    </span>
                </div>
            </div>

            {/* --- AI FEEDBACK CARD (Violet Theme) --- */}
            {showAi && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="w-full bg-white rounded-2xl border border-violet-100 shadow-xl shadow-violet-100/50 overflow-hidden relative">
                        
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-violet-100/50 rounded-full blur-3xl pointer-events-none"></div>

                        {/* AI Header */}
                        <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-violet-100 flex items-center gap-3">
                            <div className="p-1.5 bg-white border border-violet-100 rounded-lg text-violet-600 shadow-sm">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-violet-900">AI Code Analysis</h3>
                        </div>

                        {/* AI Content */}
                        <div className="p-6 min-h-[100px] relative z-10">
                            {aiLoading ? (
                                <div className="flex flex-col items-center justify-center space-y-3 py-4 text-violet-400/60">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                    <span className="text-sm font-medium animate-pulse text-violet-400">Analyzing logic...</span>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed whitespace-pre-line">
                                    {aiFeedback}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- FAILED TEST CASES --- */}
            {submission.failedTestCases?.length > 0 && (
                <div className="pt-2 animate-in fade-in duration-700">
                    <h2 className="text-lg font-bold text-base-content flex items-center gap-2 mb-4 px-1">
                        <AlertCircle className="w-5 h-5 text-error" />
                        Failed Test Cases
                    </h2>

                    <div className="space-y-3">
                        {submission.failedTestCases.map((tc) => (
                            <details
                                key={tc.id}
                                className="group border border-base-200 rounded-xl bg-base-100 overflow-hidden open:ring-1 open:ring-base-300 transition-all shadow-sm"
                            >
                                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/40 transition-colors select-none">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-error shrink-0 animate-pulse"></div>
                                        <span className="font-mono text-sm text-base-content/70 truncate">
                                            Input: {tc.input_data}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-base-content/30 group-open:rotate-90 transition-transform duration-200" />
                                </summary>

                                <div className="px-4 pb-6 pt-2 bg-base-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        
                                        {/* Input */}
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-1">Input</span>
                                            <div className="p-3 bg-white rounded-lg font-mono text-base-content break-all border border-base-200 shadow-sm">
                                                {tc.input_data}
                                            </div>
                                        </div>

                                        {/* Expected */}
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-success/70 mb-1">Expected</span>
                                            <div className="p-3 bg-success/5 rounded-lg font-mono text-base-content break-all border border-success/10 shadow-sm">
                                                {tc.expected_output}
                                            </div>
                                        </div>

                                        {/* Actual */}
                                        <div className="md:col-span-2">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-error/70 mb-1">Your Output</span>
                                            <div className="p-3 bg-error/5 rounded-lg font-mono text-base-content break-all border border-error/10 shadow-sm">
                                                {tc.stdout || tc.actual_output || <span className="italic opacity-50">Empty output</span>}
                                            </div>
                                        </div>

                                        {/* Error Log */}
                                        {tc.stderr && (
                                            <div className="md:col-span-2">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-error mb-1">Error Log</span>
                                                <div className="p-3 bg-error/10 text-error rounded-lg font-mono break-all text-xs border border-error/20">
                                                    {tc.stderr}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubmissionDetail;