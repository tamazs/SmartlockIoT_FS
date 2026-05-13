import { useLogsSSE, useAlertsSSE } from "../hooks/useSse";
import LogList from "../components/dashboard/LogList";
import AlertList from "../components/dashboard/AlertList";
import type { Log, Alert } from "../generated-ts-client";

export default function DashboardPage() {
    const liveLogs = useLogsSSE();
    const liveAlerts = useAlertsSSE();

    const logs: Log[] = liveLogs ?? [];
    const alerts: Alert[] = liveAlerts ?? [];

    const accessDeniedCount = logs.filter(l => l.event?.toUpperCase() === "DENIED").length;
    const unresolvedAlerts = alerts.filter(a => !a.isResolved).length;
    const criticalAlerts = alerts.filter(a => ["critical", "error"].includes(a.severity?.toLowerCase())).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-base-content/50 text-sm mt-0.5">SmartLock overview — real-time monitoring</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Total Logs</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-primary">{logs.length}</span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Access Denied</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className={`text-2xl font-bold ${accessDeniedCount > 0 ? "text-warning" : ""}`}>
                                {accessDeniedCount}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Unresolved Alerts</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className={`text-2xl font-bold ${unresolvedAlerts > 0 ? "text-warning" : "text-success"}`}>
                                {unresolvedAlerts}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="card-body p-4">
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">Critical Alerts</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className={`text-2xl font-bold ${criticalAlerts > 0 ? "text-error" : "text-success"}`}>
                                {criticalAlerts}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs and alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <h2 className="font-semibold mb-3">Recent Logs</h2>
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body p-4">
                            <LogList logs={logs} maxItems={10} />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="font-semibold mb-3">Recent Alerts</h2>
                    <div className="card bg-base-100 shadow-sm border border-base-300">
                        <div className="card-body p-4">
                            <AlertList alerts={alerts} maxItems={5} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
