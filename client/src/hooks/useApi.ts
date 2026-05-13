import {
    ActionClient,
    AuthClient,
    CodeTypeClient,
    type LoginRequestDto,
    type RegisterRequestDto,
    type CreateEntryCodeRequest,
    type CreateEntryCodeTypeRequest,
    type UpdateEntryCodeTypeRequest,
} from "../generated-ts-client.ts";
import {finalUrl} from "../baseUrl.ts";
import toast from "react-hot-toast";
import customcatch from "../errors/customCatch.ts";
import {useSetAtom} from "jotai";
import {accessTokenAtom, loggedInUserAtom, refreshTokenAtom} from "../atoms/atom.ts";
import { useNavigate } from "react-router";
import {customFetch} from "./customFetch.ts";

const authClient = new AuthClient(finalUrl);
const authClientAuth = new AuthClient(finalUrl, customFetch);
const actionClient = new ActionClient(finalUrl, customFetch);
const codeTypeClient = new CodeTypeClient(finalUrl, customFetch);

export default function useApi() {
    const navigate = useNavigate();

    const setLoggedInUser = useSetAtom(loggedInUserAtom);
    const setAccessToken = useSetAtom(accessTokenAtom);
    const setRefreshToken = useSetAtom(refreshTokenAtom);

    async function loginUser(dto: LoginRequestDto) {
        try {
            const result = await authClient.loginUser(dto);
            setLoggedInUser(result.user ?? null);
            setAccessToken(result.token);
            setRefreshToken(result.refreshToken);
            localStorage.setItem("accessToken", result.token);
            localStorage.setItem("refreshToken", result.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.user));
            toast.success("Login successful!");
            navigate("/");
        } catch (e) {
            customcatch(e);
        }
    }

    async function registerUser(dto: RegisterRequestDto) {
        try {
            const result = await authClient.registerUser(dto);
            toast.success("Register successful!");
            navigate("/login");
            return result;
        } catch (e) {
            customcatch(e);
        }
    }

    async function logoutUser() {
        setAccessToken(null);
        setRefreshToken(null);
        setLoggedInUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login");
    }

    async function getCodes() {
        try {
            return await actionClient.getCodes();
        } catch (e) {
            customcatch(e);
        }
    }

    async function addCode(req: CreateEntryCodeRequest) {
        try {
            const result = await actionClient.addCode(req);
            toast.success("Code created!");
            return result;
        } catch (e) {
            customcatch(e);
        }
    }

    async function deleteCode(id: string) {
        try {
            await actionClient.deleteCode(id);
            toast.success("Code deleted!");
        } catch (e) {
            customcatch(e);
        }
    }

    async function getCodeTypes() {
        try {
            return await codeTypeClient.getCodeTypes();
        } catch (e) {
            customcatch(e);
        }
    }

    async function createCodeType(req: CreateEntryCodeTypeRequest) {
        try {
            const result = await codeTypeClient.createCodeType(req);
            toast.success("Code type created!");
            return result;
        } catch (e) {
            customcatch(e);
        }
    }

    async function updateCodeType(id: string, req: UpdateEntryCodeTypeRequest) {
        try {
            const result = await codeTypeClient.updateCodeType(id, req);
            toast.success("Code type updated!");
            return result;
        } catch (e) {
            customcatch(e);
        }
    }

    async function deleteCodeType(id: string) {
        try {
            await codeTypeClient.deleteCodeType(id);
            toast.success("Code type deleted!");
        } catch (e) {
            customcatch(e);
        }
    }

    async function getUsers() {
        try {
            return await authClientAuth.getUsers();
        } catch (e) {
            customcatch(e);
        }
    }

    return {
        loginUser,
        registerUser,
        logoutUser,
        getCodes,
        addCode,
        deleteCode,
        getCodeTypes,
        createCodeType,
        updateCodeType,
        deleteCodeType,
        getUsers,
    };
}
