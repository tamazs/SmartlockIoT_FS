import { Navigate } from "react-router";
import { useAtom } from "jotai";
import type {JSX} from "react";

import { loggedInUserAtom } from "../atoms/atom.ts";

export default function ProtectedRoute({
                                           children,
                                       }: {
    children: JSX.Element;
}) {

    const [loggedInUser] = useAtom(loggedInUserAtom);

    // Not logged in
    if (!loggedInUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
}