import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useMeasurementsSSE, useAlertsSSE } from "../hooks/useSse";
import useApi from "../hooks/useApi";
import type { TurbineActionDto } from "../generated-ts-client";
import StatCard from "../components/ui/StatCard";
import CommandPanel from "../components/turbine/CommandPanel";
import AlertList from "../components/dashboard/AlertList";
import ActionHistory from "../components/turbine/ActionHistory";
import { MetricChart, TemperatureChart } from "../components/charts/MetricChart";

export default function TurbinePage() {
    const { turbineId } = useParams<{ turbineId: string }>();
    const api = useApi();
    const [actions, setActions] = useState<TurbineActionDto[]>([]);
    const [tab, setTab] = useState<"metrics" | "alerts" | "history">("metrics");
    const [limit, setLimit] = useState(100);

    const allMeasurements = useMeasurementsSSE();
    const allAlerts = useAlertsSSE();

    const measurements = (allMeasurements ?? [])
        .filter(m => m.turbineId === turbineId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .slice(-limit);

    const alerts = (allAlerts ?? []).filter(a => a.turbineId === turbineId);
    const latest = measurements[measurements.length - 1] ?? null;

    useEffect(() => {
        setTab("metrics");
        api.getActions(turbineId!).then(result => {
            if (result) setActions(result);
        });
    }, [turbineId]);

    function statusColor(s?: string) {
        const map: Record<string, string> = { running: "badge-success", stopped: "badge-error", maintenance: "badge-warning" };
        return map[s?.toLowerCase() ?? ""] ?? "badge-neutral";
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{latest?.turbineName ?? turbineId}</h1>
                    {latest && <span className={`badge ${statusColor(latest.status)}`}>{latest.status}</span>}
                    {latest && <span className="badge badge-outline badge-xs animate-pulse">LIVE</span>}
                </div>
                <p className="text-base-content/50 text-sm mt-0.5">{turbineId} · Farm {latest?.farmId ?? "—"}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Power Output" value={latest?.powerOutput.toFixed(1) ?? "—"} unit="kW" color="success" />
                        <StatCard label="Wind Speed" value={latest?.windSpeed.toFixed(1) ?? "—"} unit="m/s" color="info" />
                        <StatCard label="Rotor Speed" value={latest?.rotorSpeed.toFixed(1) ?? "—"} unit="RPM" color="primary" />
                        <StatCard label="Blade Pitch" value={latest?.bladePitch.toFixed(1) ?? "—"} unit="°" color="warning" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Generator Temp" value={latest?.generatorTemp.toFixed(1) ?? "—"} unit="°C" color={latest && latest.generatorTemp > 80 ? "error" : "primary"} />
                        <StatCard label="Gearbox Temp" value={latest?.gearboxTemp.toFixed(1) ?? "—"} unit="°C" color={latest && latest.gearboxTemp > 70 ? "error" : "primary"} />
                        <StatCard label="Vibration" value={latest?.vibration.toFixed(2) ?? "—"} unit="g" color={latest && latest.vibration > 5 ? "warning" : "primary"} />
                        <StatCard label="Nacelle Dir." value={latest?.nacelleDirection.toFixed(0) ?? "—"} unit="°" />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="tabs tabs-boxed w-fit">
                            <button className={`tab ${tab === "metrics" ? "tab-active" : ""}`} onClick={() => setTab("metrics")}>Metrics</button>
                            <button className={`tab ${tab === "alerts" ? "tab-active" : ""}`} onClick={() => setTab("alerts")}>
                                Alerts
                                {alerts.filter(a => a.severity === "critical").length > 0 && (
                                    <span className="badge badge-error badge-xs ml-1">{alerts.filter(a => a.severity === "critical").length}</span>
                                )}
                            </button>
                            <button className={`tab ${tab === "history" ? "tab-active" : ""}`} onClick={() => setTab("history")}>Action History</button>
                        </div>

                        {tab === "metrics" && (
                            <select
                                className="select select-sm select-bordered"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                            >
                                <option value={50}>Last 50</option>
                                <option value={100}>Last 100</option>
                                <option value={250}>Last 250</option>
                                <option value={500}>Last 500</option>
                                <option value={99999}>All</option>
                            </select>
                        )}
                    </div>

                    {tab === "metrics" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <MetricChart data={measurements} metric="powerOutput" label="Power Output" unit="kW" color="#22c55e" />
                                <MetricChart data={measurements} metric="windSpeed" label="Wind Speed" unit="m/s" color="#3b82f6" />
                                <MetricChart data={measurements} metric="rotorSpeed" label="Rotor Speed" unit="RPM" color="#570df8" />
                                <MetricChart data={measurements} metric="vibration" label="Vibration" unit="g" color="#f59e0b" />
                            </div>
                            <TemperatureChart data={measurements} />
                        </div>
                    )}

                    {tab === "alerts" && (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-4">
                                <AlertList alerts={alerts} />
                            </div>
                        </div>
                    )}

                    {tab === "history" && (
                        <div className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-4">
                                <ActionHistory actions={actions} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-1">
                    <CommandPanel
                        turbineId={turbineId!}
                        onSuccess={() => api.getActions(turbineId!).then(result => {
                            if (result) setActions(result);
                        })}
                    />
                </div>
            </div>
        </div>
    );
}