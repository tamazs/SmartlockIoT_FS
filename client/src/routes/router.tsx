import {createBrowserRouter} from "react-router";

import Layout from "../layout/Layout.tsx";
import LoginPage from "../pages/LoginPage.tsx";

import ProtectedRoute from "./ProtectedRoute.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import TurbinePage from "../pages/TurbinePage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [

            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: "turbine/:turbineId",
                element: (
                    <ProtectedRoute>
                        <TurbinePage />
                    </ProtectedRoute>
                )
            }
        ]
    },

    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
]);