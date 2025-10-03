import { Check, Star, ChevronDown, Search} from "lucide-react";
import { useState, useRef } from "react";
import useProblemStore from "../store/useProblemStore";
import { getProblems, getTagProblems, getSearchProblems } from "../api/problemApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import LoaderComponent from "../components/Loader";


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
      setProblems(res.data.data); // replace current problems
      setHasMore(false)
    } catch (error) {
      console.log("Error fetching tag problems:", error);
      toast.error("Failed to load problems for tag");
    } finally {
      setProblemsLoading(false);
    }
  };

  // Load more problems without resetting scroll
  const loadMoreProblems = async () => {
    try {
      setProblemsLoading(true);

      // Save current scroll
      const scrollY = window.scrollY;

      const response = await getProblems({
        limit: 10,
        cursor_date: nextCursorDate,
        cursor_id: nextCursorId,
      });

      if (response.data.success) {
        const prevLength = problems.length;

        addProblems(response.data.data); // append new problems
        setNextCursor(response.data.next_cursor_date, response.data.next_cursor_id);
        setHasMore(response.data.has_more);

        // Restore scroll
        window.scrollTo({ top: scrollY, behavior: "auto" });
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
      setProblems(res.data.data); // replace current problems
      setHasMore(false)
    } catch (error) {
      console.log("Error fetching search problems:", error);
      toast.error("Failed to search problems");
    } finally {
      setProblemsLoading(false);
    }
  }, 500)


  return (
    <div className="container mx-auto px-4 mt-6">
      <div className="card bg-black/40 backdrop-blur-lg shadow-xl p-6 max-w-5xl mx-auto rounded-lg">
        
        <h2 className="text-xl font-bold text-gray-200 mb-4">
          <span className="cursor-pointer" onClick={() => navigate(0)}>
            Problems
          </span>
        </h2>


        {/* Tags */}
        <div className="relative mb-2 flex items-start">
          <div
            ref={tagsContainerRef}
            className={`flex flex-wrap gap-2 transition-[max-height] duration-300 relative`}
            style={{
              maxHeight: expanded
                ? `${tagsContainerRef.current?.scrollHeight}px`
                : "2.26rem",
              overflow: "hidden",
            }}
          >
            {tagLoading ? (
              <span className="text-gray-400 text-sm font-mono curs">Loading tags...</span>
            ) : (
              allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagProblems(tag.slug)}
                  className="text-gray-100 text-sm px-3 py-1 font-mono rounded-full cursor-pointer"
                >
                  {tag.name}
                </button>
              ))
            )}

            {!expanded && (
              <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-2 p-1 text-gray-300 hover:text-white flex-shrink-0 sticky top-0 cursor-pointer"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search problems..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-gray-600 text-gray-100 rounded-md placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Problem Table */}
        <div className="overflow-x-auto">
          {problemsLoading && problems.length === 0 ? (
            <span className="text-gray-400 text-sm font-mono">Loading problems...</span>
          ) : (
            <table className="w-full text-left text-gray-300 table-auto">
              <tbody>
                {problems.map((p, idx) => (
                  <tr
                    key={p.id}
                    id={`problem-${p.id}`}
                    className="group hover:cursor-pointer transition"
                  >
                    <td
                      className="px-4 py-3 text-center w-12"
                      onClick={() => handleNavigate(p.slug)}
                    >
                      {p.user_submission_passed ? (
                        <Check size={24} strokeWidth={1.5} className="text-green-400 mx-auto" />
                      ) : (
                        <div />
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 text-center w-8"
                      onClick={() => handleNavigate(p.slug)}
                    >
                      {idx + 1}.
                    </td>
                    <td
                      className="px-4 py-3 font-medium truncate max-w-[150px]"
                      title={p.title}
                      onClick={() => handleNavigate(p.slug)}
                    >
                      {p.title}
                    </td>
                    <td
                      className="px-4 py-3 w-24"
                      onClick={() => handleNavigate(p.slug)}
                    >
                      <span
                        className={`font-semibold ${p.difficulty === "Easy"
                          ? "text-blue-400"
                          : p.difficulty === "Medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {p.difficulty}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-center cursor-pointer w-16"
                    >
                      <Star size={16} className="mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Load More */}
        <div className="mt-4 text-center">
          {hasMore ? (
            <button
              onClick={loadMoreProblems}
              className="px-4 py-2 btn btn-sm hover:bg-[#1e1e1e] text-white rounded-md"
              disabled={problemsLoading}
            >
              {problemsLoading ? "Loading..." : "Load More"}
            </button>
          ) : (
            <span className="text-gray-400 text-sm">No more problems</span>
          )}
        </div>
      </div>
    </div>
  );
}
