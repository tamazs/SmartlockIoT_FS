import type { Log } from "../../generated-ts-client.ts";

interface LogListProps {
    logs: Log[];
    maxItems?: number;
}

const eventTypeColors: Record<string, string> = {
    door: "badge-info",
    access: "badge-success",
    code: "badge-primary",
    system: "badge-ghost",
};

export default function LogList({ logs, maxItems }: LogListProps) {
    const sorted = [...logs].sort(
        (a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
    );
    const displayed = maxItems ? sorted.slice(0, maxItems) : sorted;

    if (displayed.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-base-content/30 text-sm">
                No logs
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {displayed.map((log) => {
                const typeKey = log.eventType?.toLowerCase() ?? "";
                const isDenied = log.event?.toUpperCase() === "DENIED";
                const colorClass = isDenied ? "badge-error" : (eventTypeColors[typeKey] ?? "badge-ghost");
                return (
                    <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                            isDenied ? "bg-error/5 border-error/20" : "bg-base-200/50 border-base-300"
                        }`}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`badge badge-sm ${colorClass}`}>{log.eventType}</span>
                                <span className="text-sm truncate">{log.event}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                {log.user && (
                                    <span className="text-xs font-medium text-base-content/60">
                                        {log.user.username}
                                    </span>
                                )}
                                {log.user && <span className="text-xs text-base-content/30">·</span>}
                                <span className="text-xs text-base-content/40">
                                    {new Date(log.eventTime).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
