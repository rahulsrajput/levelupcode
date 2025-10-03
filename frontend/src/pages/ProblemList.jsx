// src/pages/ProblemList.jsx
import React, { useEffect } from "react";
import ProblemsTable from "../components/ProblemsTable";
import useProblemStore from "../store/useProblemStore";
import LoaderComponent from "../components/Loader";
import { getProblems } from "../api/problemApi";
import toast from "react-hot-toast";
import { getAllTags } from "../api/problemApi";


function ProblemList() {

    const {
        setHasMore,
        setProblems,
        setNextCursor,
        setTags,
        tags: allTags,
        setTagLoading,
        setProblemsLoading
    } = useProblemStore();

    useEffect(() => {
        async function fetchInitialProblems() {
            try {
                setProblemsLoading(true);
                const response = await getProblems({ limit: 10 });
                if (response.data.success) {
                    setProblems(response.data.data);
                    setNextCursor(response.data.next_cursor_date, response.data.next_cursor_id);
                    setHasMore(response.data.has_more);
                    toast.success("Problems fetched successfully");
                } else {
                    toast.error("Failed to fetch problems");
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "API error");
            }
            finally {
                setProblemsLoading(false);
            }
        }

        fetchInitialProblems();
    }, []);


    useEffect(function () {
        async function fetchTags() {
            try {
                setTagLoading(true);
                const res = await getAllTags();
                setTags(res.data.data);
                console.log("All tags response:", res.data.data);
            } catch (error) {
                console.log("Error fetching tags:", error);
                setTags([]);
            }
            finally {
                setTagLoading(false);
            }
        }
        fetchTags();
    }, []);


    return <ProblemsTable />;
}

export default ProblemList;
