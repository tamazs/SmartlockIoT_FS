import TurbineCard from "../components/dashboard/TurbineCard";
import AlertList from "../components/dashboard/AlertList";
import { useMeasurementsSSE, useAlertsSSE } from "../hooks/useSse";
import type { Measurement, Alert } from "../generated-ts-client";
import {useAtom} from "jotai";
import {turbinesAtom} from "../atoms/atom.ts";

export default function DashboardPage() {
    const liveMeasurements = useMeasurementsSSE();
    const liveAlerts = useAlertsSSE();
    const [turbines] = useAtom(turbinesAtom);

    // Build a map of latest measurement per turbine from SSE data
    const latest: Record<string, Measurement> = {};
    if (liveMeasurements) {
        for (const m of liveMeasurements) {
            if (!latest[m.turbineId] || m.timestamp > latest[m.turbineId].timestamp) {
                latest[m.turbineId] = m;
            }
        }
    }

    const alerts: Alert[] = liveAlerts ?? [];

    const totalPower = Object.values(latest).reduce((s, m) => s + m.powerOutput, 0);
    const avgWind = Object.values(latest).length
        ? Object.values(latest).reduce((s, m) => s + m.windSpeed, 0) / Object.values(latest).length
        : 0;
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const runningCount = Object.values(latest).filter((m) => m.status?.toLowerCase() === "running").length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-base-content/50 text-sm mt-0.5">Farm overview — real-time monitoring</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Total Output</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-success">{totalPower.toFixed(1)}</span>
                            <span className="text-sm text-base-content/50">kW</span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Avg Wind Speed</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-info">{avgWind.toFixed(1)}</span>
                            <span className="text-sm text-base-content/50">m/s</span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Turbines Running</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold">{runningCount}</span>
                            <span className="text-sm text-base-content/50">/ {turbines.length}</span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Critical Alerts</p>
                        <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold ${criticalCount > 0 ? "text-error" : "text-success"}`}>
                {criticalCount}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Turbines grid */}
            <div>
                <h2 className="font-semibold mb-3">Turbines</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {turbines.map(({ id, name }) => (
                        <TurbineCard key={id} turbineId={id} turbineName={name} measurement={latest[id]} />
                    ))}
                </div>
            </div>

            {/* Recent alerts */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Recent Alerts</h2>
                    <a href="/alerts" className="text-xs text-primary link link-hover">View all</a>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <AlertList alerts={alerts} maxItems={5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
