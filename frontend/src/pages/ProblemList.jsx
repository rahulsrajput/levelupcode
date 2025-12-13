import React, { useEffect } from "react";
import ProblemsTable from "../components/ProblemsTable";
import useProblemStore from "../store/useProblemStore";
import { getProblems, getAllTags } from "../api/problemApi";
import toast from "react-hot-toast";

function ProblemList() {
    const {
        setHasMore,
        setProblems,
        setNextCursor,
        setTags,
        setTagLoading,
        setProblemsLoading
    } = useProblemStore();

    useEffect(() => {
        let isMounted = true;

        async function fetchInitialProblems() {
            try {
                setProblemsLoading(true);
                const response = await getProblems({ limit: 5 });
                if (isMounted && response.data.success) {
                    setProblems(response.data.data);
                    setNextCursor(response.data.next_cursor_date, response.data.next_cursor_id);
                    setHasMore(response.data.has_more);
                }
            } catch (err) {
                if (isMounted) toast.error("Failed to retrieve problems");
            } finally {
                if (isMounted) setProblemsLoading(false);
            }
        }

        fetchInitialProblems();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function fetchTags() {
            try {
                setTagLoading(true);
                const res = await getAllTags();
                if (isMounted) setTags(res.data.data);
            } catch (error) {
                console.log("Error fetching tags");
            } finally {
                if (isMounted) setTagLoading(false);
            }
        }
        fetchTags();
        return () => { isMounted = false; };
    }, []);

    return (
        // Clean white/base background, no extra margins
        <div className="min-h-screen">
            <ProblemsTable />
        </div>
    );
}

export default ProblemList;