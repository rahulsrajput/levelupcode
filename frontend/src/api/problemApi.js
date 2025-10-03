// src/api/problemApi.js
import axiosInstance from "./axiosInstance";


const getProblems = async function (params = {}) {
    const response = await axiosInstance.get("core/problem/problemset/", { params });
    return response;
}

const getAllTags = async function () {
    const response  = await axiosInstance.get("core/problem/tags/")
    return response
}

const getTagProblems = async function (slug) {
    const response = await axiosInstance.get(`core/problem/tags/${slug}/`)
    return response
}

const getProblemBySlug = async function (slug) {
    const response = await axiosInstance.get(`core/problem/${slug}/`)
    return response
}

const getSearchProblems = async function (query){
    const response = await axiosInstance.get(`core/problem/problemset/search/?query=${query}`)
    return response
}

const getProblemSubmissionsByUser = async function (slug) {
    const response = await axiosInstance.get(`core/problem/${slug}/submissions/`)
    return response
}


const getSubmissionDetail = async function (slug, id){
    const response = await axiosInstance.get(`core/problem/${slug}/submissions/${id}/`)
    return response
}


const getAllLanguages = async function (){
    const response = await axiosInstance.get('core/problem/languages/')
    return response
}

const submitProblem = async function (data) {
    const response = await axiosInstance.post('core/problem/submit/', data)
    return response
}

const submitProblemStatus = async function (data){
    const response = await axiosInstance.get(`core/problem/submit/${data}/`)
    return response
}

export {
    getProblems,
    getAllTags,
    getTagProblems,
    getProblemBySlug,
    getProblemSubmissionsByUser,
    submitProblem,
    getAllLanguages,
    submitProblemStatus,
    getSubmissionDetail,
    getSearchProblems
};
