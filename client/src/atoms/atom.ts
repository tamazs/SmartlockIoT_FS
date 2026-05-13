import {atom} from "jotai";
import type {UserDto} from "../generated-ts-client.ts";

export const loggedInUserAtom = atom<UserDto | null>(JSON.parse(localStorage.getItem("user") || "null") as UserDto | null);
export const accessTokenAtom = atom<string | null>(localStorage.getItem("accessToken"));
export const refreshTokenAtom = atom<string | null>(localStorage.getItem("refreshToken"));
