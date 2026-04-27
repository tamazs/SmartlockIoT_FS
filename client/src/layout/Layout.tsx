import { Outlet } from "react-router";
import Sidebar from "../components/ui/Sidebar";

export default function Layout() {

    return (
        <div className="flex min-h-screen bg-base-200">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}