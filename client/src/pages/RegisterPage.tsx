import { useState } from "react";
import { Link } from "react-router";
import useApi from "../hooks/useApi";
import type {RegisterRequestDto} from "../generated-ts-client.ts";

export default function RegisterPage() {
    const [form, setForm] = useState<RegisterRequestDto>({ userName: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const api = useApi();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        await api.registerUser(form);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl font-bold tracking-tight">FS+IoT</span>
                    </div>
                    <p className="text-base-content/60 text-sm">Wind Turbine Control Centre</p>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Create account</h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Username</legend>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="johndoe"
                                    value={form.userName}
                                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                                    required
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Email</legend>
                                <input
                                    type="email"
                                    className="input input-bordered w-full"
                                    placeholder="john@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Password</legend>
                                <input
                                    type="password"
                                    className="input input-bordered w-full"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </fieldset>

                            <button
                                type="submit"
                                className={`btn btn-primary w-full mt-2 ${loading ? "loading" : ""}`}
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create account"}
                            </button>
                        </form>

                        <div className="divider text-xs">or</div>
                        <p className="text-center text-sm text-base-content/60">
                            Already have an account?{" "}
                            <Link to="/login" className="link link-primary">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
