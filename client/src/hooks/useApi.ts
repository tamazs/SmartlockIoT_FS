import {
    ActionClient,
    AuthClient,
    type LoginRequestDto,
    type RegisterRequestDto,
    type TurbineCommand
} from "../generated-ts-client.ts";
import {finalUrl} from "../baseUrl.ts";
import toast from "react-hot-toast";
import customcatch from "../errors/customCatch.ts";
import {useAtom} from "jotai";
import {accessTokenAtom, loggedInUserAtom, refreshTokenAtom} from "../atoms/atom.ts";
import { useNavigate } from "react-router";
import {customFetch} from "./customFetch.ts";

const authClient = new AuthClient(finalUrl);
const actionClient = new ActionClient(finalUrl, customFetch)

export default function useApi() {
    const navigate = useNavigate();

    const [, setLoggedInUser] = useAtom(loggedInUserAtom);
    const [, setAccessToken] = useAtom(accessTokenAtom);
    const [, setRefreshToken] = useAtom(refreshTokenAtom);

    async function loginUser(dto : LoginRequestDto) {
        try {
            const result = await authClient.loginUser(dto)
            // @ts-ignore
            setLoggedInUser(result.user ?? null)
            setAccessToken(result.token)
            setRefreshToken(result.refreshToken)

            localStorage.setItem("accessToken", result.token);
            localStorage.setItem("refreshToken", result.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.user));

            toast.success("Login successful!");

                navigate("/");
        } catch (e) {
            customcatch(e)
        }
    }

    async function registerUser(dto: RegisterRequestDto) {
        try {
            const result = await authClient.registerUser(dto);
            toast.success("Register successful!");
            navigate("/login");
            return result;
        }
        catch (e) {
            customcatch(e);
        }
    }

    async function logoutUser() {
        setAccessToken(null);
        setRefreshToken(null);
        // @ts-ignore
        setLoggedInUser(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        navigate("/login");
    }

    async function sendAction(turbineId: string, action: TurbineCommand) {
        try {
            const result = await actionClient.sendCommand(turbineId, action);
            toast.success("Action sent successfully!");
            return result;
        }
        catch (e) {
            customcatch(e);
        }
    }

    async function getActions(turbineId: string) {
        try {
            const result = await actionClient.getActions(turbineId);
            return result;
        }
        catch (e) {
            customcatch(e);
        }
    }

    return {
        loginUser,
        registerUser,
        logoutUser,
        sendAction,
        getActions
    }
}