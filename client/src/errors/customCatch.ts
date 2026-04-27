import toast from "react-hot-toast";

import {ApiException} from "../generated-ts-client.ts";

import type {ProblemDetails} from "./problemDetails.ts";

export default function customcatch(e : any) {
    if (e instanceof ApiException) {
        const problemDetails = JSON.parse(e.response) as ProblemDetails;
        toast.error(problemDetails.title);
    }
}