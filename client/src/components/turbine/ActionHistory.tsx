import type { TurbineActionDto } from "../../generated-ts-client";

const actionColors: Record<string, string> = {
    start: "badge-success",
    stop: "badge-error",
    setInterval: "badge-info",
    setPitch: "badge-warning",
};

export default function ActionHistory({ actions }: { actions: TurbineActionDto[] }) {
    if (actions.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-base-content/30 text-sm">
                No actions recorded
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-sm">
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Operator</th>
                </tr>
                </thead>
                <tbody>
                {actions.map((a) => (
                    <tr key={a.id} className="hover">
                        <td className="text-xs text-base-content/60 whitespace-nowrap">
                            {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td>
                                <span className={`badge badge-sm ${actionColors[a.actionType] ?? "badge-neutral"}`}>
                                    {a.actionType}
                                </span>
                        </td>
                        <td className="text-xs text-base-content/60">
                            {a.actionType === "stop" && a.stopReason && `Reason: ${a.stopReason}`}
                            {a.actionType === "setPitch" && a.pitchAngle != null && `Angle: ${a.pitchAngle}°`}
                            {a.actionType === "setInterval" && a.intervalValue != null && `Interval: ${a.intervalValue}s`}
                            {a.actionType === "start" && "—"}
                        </td>
                        <td className="text-xs text-base-content/60">{a.userName}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}