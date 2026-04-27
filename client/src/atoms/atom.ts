import {atom} from "jotai";
import type {UserDto} from "../generated-ts-client.ts";

export const loggedInUserAtom = atom<UserDto | null>(JSON.parse(localStorage.getItem("user") || "null"));
export const accessTokenAtom = atom<string | null>(localStorage.getItem("accessToken"));
export const refreshTokenAtom = atom<string | null>(localStorage.getItem("refreshToken"));

export interface TurbineInfo {
    id: string;
    name: string;
}

export const turbinesAtom = atom<TurbineInfo[]>([]);