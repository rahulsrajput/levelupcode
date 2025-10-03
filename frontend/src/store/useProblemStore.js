// src/store/useProblemStore.js
import { create } from "zustand";

const useProblemStore = create((set) => ({
  problems: [],
  tags: [],
  hasMore: true,
  loading: false,
  nextCursorDate: null,
  nextCursorId: null,
  tagLoading: false,
  problemsLoading: false,
  languageList: [],

  // Replace all problems
  setProblems: function (problemList) {
    set({ problems: problemList });
  },

  // Append problems
  addProblems: function (problemsList) {
    set((state) => ({ problems: state.problems.concat(problemsList) }));
  },

  // Set loading state
  setLoading: function (val) {
    set({ loading: val });
  },

  // Set hasMore flag
  setHasMore: function (val) {
    set({ hasMore: val });
  },

  // Set next cursor
  setNextCursor: function (date, id) {
    set({ nextCursorDate: date, nextCursorId: id });
  },

  // Set tags
  setTags: function (tags) {
    set({ tags: tags });
  },

  // Set tag loading state
  setTagLoading: function (val) {
    set({ tagLoading: val });
  },

  // Set problems loading state
  setProblemsLoading: function (val) {
    set({ problemsLoading: val });
  },

  // Set language list
  setLanguageList: function (val) {
    set({ languageList: val });
  },

  // Reset store
  reset: function () {
    set({
      problems: [],
      tags: [],
      hasMore: true,
      loading: false,
      nextCursorDate: null,
      nextCursorId: null,
    });
  },
}));

export default useProblemStore;
