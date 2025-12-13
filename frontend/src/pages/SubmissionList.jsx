import React from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Cpu, Clock, Calendar, FileCode, ChevronRight } from 'lucide-react';

function SubmissionList() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { submissions } = useOutletContext();

    const handleSubmissionClick = (submissionId) => {
        navigate(`/problems/${slug}/submissions/${submissionId}`);
    };

    if (!submissions || submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 rounded-3xl text-center">
                <div className="bg-base-200/50 p-5 rounded-full mb-4">
                    <FileCode className="w-8 h-8 text-base-content/40" />
                </div>
                <h3 className="text-lg font-bold text-base-content">No submissions yet</h3>
                <p className="text-base-content/60 mt-1">
                    Complete the problem to see your history here.
                </p>
            </div>
        );
    }

    // Modern "Dot" style for status
    const getStatusConfig = (status) => {
        switch (status) {
            case "Passed":
                return { color: "text-emerald-600", bg: "bg-emerald-500", label: "Passed" };
            case "Failed":
                return { color: "text-rose-600", bg: "bg-rose-500", label: "Failed" };
            default:
                return { color: "text-amber-600", bg: "bg-amber-500", label: status };
        }
    };

    return (
        <div className="w-full bg-base-50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    
                    {/* Header */}
                    <thead>
                        <tr className="border-b border-base-200 bg-base-100/50">
                            <th className="py-5 pl-8 text-xs font-bold uppercase tracking-widest text-base-content/40">#</th>
                            <th className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-base-content/40">Status</th>
                            <th className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-base-content/40">Language</th>
                            <th className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-base-content/40">Date</th>
                            <th className="py-5 px-4 text-xs font-bold uppercase tracking-widest text-base-content/40">Performance</th>
                            <th className="py-5 pr-8"></th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="text-sm">
                        {submissions.map((sub, idx) => {
                            const statusConfig = getStatusConfig(sub.status);
                            
                            return (
                                <tr
                                    key={sub.id}
                                    onClick={() => handleSubmissionClick(sub.id)}
                                    className="group cursor-pointer border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-all duration-200"
                                >
                                    {/* Index */}
                                    <td className="py-5 pl-8 font-medium text-base-content/30 group-hover:text-base-content/60 transition-colors">
                                        {idx + 1}
                                    </td>

                                    {/* Status (Elegant Dot) */}
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`relative flex h-2.5 w-2.5`}>
                                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.bg}`}></span>
                                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.bg}`}></span>
                                            </span>
                                            <span className={`font-bold ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Language */}
                                    <td className="py-5 px-4">
                                        <span className="font-semibold text-base-content/80">
                                            {sub.language}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="py-5 px-4">
                                        <div className="flex flex-col text-xs">
                                            <span className="text-base-content/80 font-medium">
                                                {new Date(sub.createdAt || sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-base-content/40">
                                                {new Date(sub.createdAt || sub.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Performance (Merged Runtime/Memory for cleanliness) */}
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-3">
                                            {/* Runtime Pill */}
                                            <div className="flex items-center gap-1.5 bg-base-200/60 px-2.5 py-1.5 rounded-lg border border-base-200">
                                                <Clock className="w-3.5 h-3.5 text-secondary" />
                                                <span className="font-mono text-xs font-bold text-base-content/70">
                                                    {sub.runtime ? `${sub.runtime}ms` : "-"}
                                                </span>
                                            </div>
                                            
                                            {/* Memory Pill */}
                                            <div className="flex items-center gap-1.5 bg-base-200/60 px-2.5 py-1.5 rounded-lg border border-base-200">
                                                <Cpu className="w-3.5 h-3.5 text-accent" />
                                                <span className="font-mono text-xs font-bold text-base-content/70">
                                                    {sub.memory ? `${sub.memory}kb` : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Arrow Icon */}
                                    <td className="py-5 pr-8 text-right">
                                        <ChevronRight className="w-5 h-5 text-base-content/40 group-hover:text-secondary transition-colors" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SubmissionList;