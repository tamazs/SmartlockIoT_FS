import { NavLink } from "react-router";
import {loggedInUserAtom, turbinesAtom} from "../../atoms/atom.ts";
import {useAtom} from "jotai";
import useApi from "../../hooks/useApi.ts";

export default function Sidebar() {
    const [loggedInUser] = useAtom(loggedInUserAtom);
    const api = useApi();
    const [turbines] = useAtom(turbinesAtom);

    return (
        <aside className="w-64 min-h-screen bg-base-100 border-r border-base-300 flex flex-col">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-base-300">
                <div className="flex items-center gap-2">
                    <div>
                        <div className="font-bold text-sm leading-none">FS+IoT</div>
                        <div className="text-xs text-base-content/50 mt-0.5">Control Centre</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="px-3 text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Overview</p>

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive ? "bg-primary text-primary-content" : "hover:bg-base-200"
                        }`
                    }
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </NavLink>

                <div className="pt-4">
                    <p className="px-3 text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">Turbines</p>
                    {turbines.map(({ id, name }) => (
                        <NavLink
                            key={id}
                            to={`/turbine/${id}`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive ? "bg-primary text-primary-content" : "hover:bg-base-200"
                                }`
                            }
                        >
                            <span className="w-2 h-2 rounded-full bg-success inline-block" />
                            {name}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t border-base-300">
                <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            <span className="text-xs">{loggedInUser?.userName?.[0]?.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{loggedInUser?.userName}</div>
                    </div>
                    <button onClick={() => api.logoutUser()} className="btn btn-ghost btn-xs" title="Logout">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
