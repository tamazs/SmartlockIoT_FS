import { useState } from "react";
import useApi from "../../hooks/useApi.ts";
import type {SetIntervalCommand, SetPitchCommand, StopCommand, TurbineCommand} from "../../generated-ts-client";

interface CommandPanelProps {
    turbineId: string;
    onSuccess?: () => void;
}

export default function CommandPanel({ turbineId, onSuccess }: CommandPanelProps) {
    const api = useApi();
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [stopReason, setStopReason] = useState("");
    const [interval, setInterval] = useState(10);
    const [pitch, setPitch] = useState(15);

    async function send(command: TurbineCommand, label: string) {
        setLoading(label);
        setError(null);
        setSuccess(null);
        try {
            await api.sendAction(turbineId, command);
            setSuccess(`${label} command sent successfully`);
            onSuccess?.();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Turbine Controls
                </h3>

                {success && (
                    <div className="alert alert-success mb-3 py-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{success}</span>
                    </div>
                )}
                {error && (
                    <div className="alert alert-error mb-3 py-2">
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Start / Stop */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className={`btn btn-success btn-sm ${loading === "Start" ? "loading" : ""}`}
                            onClick={() => send({ action: "start" }, "Start")}
                            disabled={!!loading}
                        >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                            Start
                        </button>
                        <button
                            className={`btn btn-error btn-sm ${loading === "Stop" ? "loading" : ""}`}
                            onClick={() => send({ action: "stop", reason: stopReason || undefined } as StopCommand, "Stop")}
                            disabled={!!loading}
                        >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Stop
                        </button>
                    </div>

                    {/* Stop reason */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-xs">Stop reason (optional)</legend>
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full"
                            placeholder="e.g. maintenance, inspection..."
                            value={stopReason}
                            onChange={(e) => setStopReason(e.target.value)}
                        />
                    </fieldset>

                    <div className="divider my-1" />

                    {/* Blade pitch */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Blade Pitch</label>
                            <span className="badge badge-ghost badge-sm">{pitch}°</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={30}
                            step={0.5}
                            value={pitch}
                            onChange={(e) => setPitch(Number(e.target.value))}
                            className="range range-primary range-sm w-full"
                        />
                        <div className="flex justify-between text-xs text-base-content/40 mt-0.5">
                            <span>0°</span>
                            <span>30°</span>
                        </div>
                        <button
                            className={`btn btn-primary btn-sm w-full mt-2 ${loading === "SetPitch" ? "loading" : ""}`}
                            onClick={() => send({ action: "setPitch", angle: pitch } as SetPitchCommand, "SetPitch")}
                            disabled={!!loading}
                        >
                            Set Pitch
                        </button>
                    </div>

                    <div className="divider my-1" />

                    {/* Reporting interval */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Reporting Interval</label>
                            <span className="badge badge-ghost badge-sm">{interval}s</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={60}
                            step={1}
                            value={interval}
                            onChange={(e) => setInterval(Number(e.target.value))}
                            className="range range-secondary range-sm w-full"
                        />
                        <div className="flex justify-between text-xs text-base-content/40 mt-0.5">
                            <span>1s</span>
                            <span>60s</span>
                        </div>
                        <button
                            className={`btn btn-secondary btn-sm w-full mt-2 ${loading === "SetInterval" ? "loading" : ""}`}
                            onClick={() => send({ action: "setInterval", value: interval } as SetIntervalCommand, "SetInterval")}
                            disabled={!!loading}
                        >
                            Set Interval
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
