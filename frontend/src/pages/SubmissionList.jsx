import React from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Cpu, Clock } from 'lucide-react'


function SubmissionList() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { submissions } = useOutletContext(); // ✅ get from Outlet context

    const handleSubmissionClick = async (submissionId) => {
        navigate(`/problems/${slug}/submissions/${submissionId}`);
    }

    if (!submissions || submissions.length === 0) {
        return <p className="text-gray-400 font-mono">No submissions yet.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300 font-mono rounded-lg overflow-hidden">
                <thead className="bg-black/50 text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Language</th>
                        <th className="px-4 py-2">Runtime</th>
                        <th className="px-4 py-2">Memory</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((sub, idx) => (
                        <tr
                            key={sub.id}
                            className="cursor-pointer transition"
                            onClick={() => handleSubmissionClick(sub.id)}
                        >
                            {/* Index */}
                            <td className="px-4 py-2 font-semibold">#{idx + 1}</td>

                            {/* Status */}
                            <td
                                className={`px-4 py-2 font-bold ${sub.status === "Passed"
                                        ? "text-green-400"
                                        : sub.status === "Failed"
                                            ? "text-red-400"
                                            : "text-yellow-400"
                                    }`}
                            >
                                {sub.status}
                            </td>

                            {/* Date */}
                            <td className="px-4 py-2 text-gray-400">
                                {new Date(sub.createdAt || sub.created_at).toLocaleString()}
                            </td>

                            {/* Language */}
                            <td className="px-4 py-2">{sub.language}</td>

                            {/* Runtime */}
                            <td className="px-4 py-2">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-200">
                                        {sub.runtime ? `${sub.runtime} ms` : "-"}
                                    </span>
                                </div>
                            </td>

                            {/* Memory */}
                            <td className="px-4 py-2">
                                <div className="flex items-center gap-1">
                                    <Cpu className="h-5 w-5 text-gray-400" />
                                    <span className="text-gray-200">
                                        {sub.memory ? `${sub.memory} KB` : "-"}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default SubmissionList