import { CheckCircle2, Star, ChevronDown, Search, Hash, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import useProblemStore from "../store/useProblemStore";
import { getProblems, getTagProblems, getSearchProblems } from "../api/problemApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { debounce } from "lodash";

export default function ProblemTable() {
  const {
    problems,
    hasMore,
    nextCursorDate,
    nextCursorId,
    addProblems,
    setProblems,
    setNextCursor,
    setHasMore,
    tags: allTags,
    tagLoading,
    problemsLoading,
    setProblemsLoading,
  } = useProblemStore();

  const [expanded, setExpanded] = useState(false);
  const tagsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Navigate to problem
  const handleNavigate = (slug) => {
    navigate("/problems/" + slug);
  };

  // Fetch problems by tag
  const handleTagProblems = async (slug) => {
    try {
      setProblemsLoading(true);
      const res = await getTagProblems(slug);
      setProblems(res.data.data);
      setHasMore(false);
    } catch (error) {
      console.log("Error fetching tag problems:", error);
      toast.error("Failed to load problems for tag");
    } finally {
      setProblemsLoading(false);
    }
  };

  // Load more problems
  const loadMoreProblems = async () => {
    try {
      setProblemsLoading(true);
      const scrollY = window.scrollY;

      const response = await getProblems({
        limit: 10,
        cursor_date: nextCursorDate,
        cursor_id: nextCursorId,
      });

      if (response.data.success) {
        addProblems(response.data.data);
        setNextCursor(response.data.next_cursor_date, response.data.next_cursor_id);
        setHasMore(response.data.has_more);
        
        setTimeout(() => {
             window.scrollTo({ top: scrollY, behavior: "auto" });
        }, 0);
      } else {
        toast.error("Failed to load more problems");
      }
    } catch (error) {
      console.error("Error loading more problems:", error);
      toast.error(error.response?.data?.message || "Failed to load more problems");
    } finally {
      setProblemsLoading(false);
    }
  };

  // Handle Search
  const handleSearch = debounce(async (query) => {
    if (!query) return;
    try {
      setProblemsLoading(true);
      const res = await getSearchProblems(query);
      setProblems(res.data.data);
      setHasMore(false);
    } catch (error) {
      console.log("Error fetching search problems:", error);
      toast.error("Failed to search problems");
    } finally {
      setProblemsLoading(false);
    }
  }, 500);

  // Helper for Difficulty Styles (Soft/Tinted)
  const getDifficultyStyle = (diff) => {
    switch (diff) {
      case "Easy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Hard": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-base-200 text-base-content/60 border-base-300";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-300 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
                    Problem Library
                </h1>
                <p className="text-base-content/60 font-medium mt-1">
                    Sharpen your skills with <span className="text-base-content font-bold">{problems.length}</span> curated challenges.
                </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                <input
                    type="text"
                    placeholder="Search problems..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* TAGS FILTER */}
        <div className="relative">
             <div
                ref={tagsContainerRef}
                className="flex flex-wrap gap-2 transition-[max-height] duration-500 ease-in-out relative overflow-hidden"
                style={{
                    maxHeight: expanded ? `${tagsContainerRef.current?.scrollHeight}px` : "2.5rem",
                }}
            >
                {tagLoading ? (
                    <div className="flex gap-2">
                        {[1,2,3].map(i => <div key={i} className="h-8 w-20 bg-base-200 rounded-full animate-pulse"></div>)}
                    </div>
                ) : (
                    allTags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => handleTagProblems(tag.slug)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-base-200 bg-base-100 text-base-content/60 hover:border-violet-300 hover:text-violet-600 hover:shadow-sm hover:shadow-violet-100 transition-all duration-200"
                        >
                            <Hash size={10} className="opacity-50 group-hover:text-violet-500" /> 
                            {tag.name}
                        </button>
                    ))
                )}
            </div>
            
            {/* Expand Button (Only visible if needed - logic simplified for demo) */}
            <div className="absolute top-0 right-0 h-10 bg-gradient-to-l from-base-100 via-base-100 to-transparent pl-8 flex items-center">
                 <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs font-bold text-base-content/50 hover:text-violet-600 transition-colors"
                >
                    {expanded ? "Less" : "More Tags"}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </button>
            </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-base-300">
                    <th className="py-4 pl-4 w-16 text-center text-xs font-bold uppercase tracking-widest text-base-content/40">Status</th>
                    <th className="py-4 px-4 w-16 text-xs font-bold uppercase tracking-widest text-base-content/40">#</th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-base-content/40">Title</th>
                    <th className="py-4 px-4 w-32 text-xs font-bold uppercase tracking-widest text-base-content/40">Difficulty</th>
                    <th className="py-4 pr-4 w-12"></th>
                </tr>
            </thead>
            
            <tbody className="text-sm">
                {problemsLoading && problems.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="text-center py-12">
                            <span className="loading loading-spinner loading-md text-violet-500"></span>
                        </td>
                    </tr>
                ) : (
                    problems.map((p, idx) => (
                        <tr
                            key={p.id}
                            onClick={() => handleNavigate(p.slug)}
                            className="group border-b border-base-200 last:border-0 hover:bg-base-200/50 cursor-pointer transition-all duration-200"
                        >
                            {/* Status */}
                            <td className="py-4 pl-4 text-center">
                                {p.user_submission_passed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-base-300 mx-auto group-hover:bg-base-400 transition-colors" />
                                )}
                            </td>

                            {/* Index */}
                            <td className="py-4 px-4 font-mono text-base-content/40 group-hover:text-base-content/60 transition-colors">
                                {idx + 1}
                            </td>

                            {/* Title */}
                            <td className="py-4 px-4">
                                <span className="font-bold text-base text-base-content group-hover:text-violet-600 transition-colors">
                                    {p.title}
                                </span>
                            </td>

                            {/* Difficulty */}
                            <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${getDifficultyStyle(p.difficulty)}`}>
                                    {p.difficulty}
                                </span>
                            </td>

                            {/* Action Arrow */}
                            <td className="py-4 pr-4 text-right">
                                <ArrowRight className="w-5 h-5 text-base-content/20 group-hover:text-violet-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* FOOTER / LOAD MORE */}
      <div className="flex justify-center py-4">
        {hasMore ? (
          <button
            onClick={loadMoreProblems}
            disabled={problemsLoading}
            className="btn btn-ghost hover:bg-violet-50 text-violet-600 hover:text-violet-700 font-bold tracking-wide"
          >
            {problemsLoading ? (
                <span className="loading loading-dots loading-sm"></span>
            ) : (
                <>Load More Problems <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        ) : (
          <div className="text-center py-6">
              <div className="w-12 h-1 bg-base-300 rounded-full mx-auto mb-2"></div>
              <span className="text-base-content/40 text-xs font-bold uppercase tracking-widest">End of list</span>
          </div>
        )}
      </div>

    </div>
  );
}