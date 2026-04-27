import type {Alert} from "../../generated-ts-client.ts";

interface AlertListProps {
    alerts: Alert[];
    maxItems?: number;
}

function SeverityIcon({ severity }: { severity: string }) {
    if (severity === "critical")
        return <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
    if (severity === "warning")
        return <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
    return <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
}

const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };

export default function AlertList({ alerts, maxItems }: AlertListProps) {
    const sorted = [...alerts].sort(
        (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
    );
    const displayed = maxItems ? sorted.slice(0, maxItems) : sorted;

    if (displayed.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-base-content/30 text-sm">
                No alerts
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {displayed.map((alert) => (
                <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.severity === "critical"
                            ? "bg-error/5 border-error/20"
                            : alert.severity === "warning"
                                ? "bg-warning/5 border-warning/20"
                                : "bg-info/5 border-info/20"
                    }`}
                >
                    <div className="mt-0.5 shrink-0">
                        <SeverityIcon severity={alert.severity} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">{alert.message}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-base-content/40">{alert.turbineId}</span>
                            <span className="text-xs text-base-content/30">·</span>
                            <span className="text-xs text-base-content/40">{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
