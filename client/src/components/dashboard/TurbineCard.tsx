import { Link } from "react-router";
import type {Measurement} from "../../generated-ts-client.ts";

interface TurbineCardProps {
    turbineId: string;
    turbineName: string;
    measurement?: Measurement | null;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        running: "badge-success",
        stopped: "badge-error",
        maintenance: "badge-warning",
        idle: "badge-neutral",
    };
    return (
        <span className={`badge badge-sm ${map[status?.toLowerCase()] ?? "badge-neutral"}`}>
      {status ?? "unknown"}
    </span>
    );
}

export default function TurbineCard({ turbineId, measurement }: TurbineCardProps) {
    const m = measurement;

    return (
        <Link to={`/turbine/${turbineId}`} className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <div className="card-body p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div>
                            <div className="font-semibold text-sm">{m?.turbineName}</div>
                            <div className="text-xs text-base-content/40">{turbineId}</div>
                        </div>
                    </div>
                    {m && <StatusBadge status={m.status} />}
                </div>

                {m ? (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-base-200 rounded-lg p-2">
                            <div className="text-xs text-base-content/50">Power</div>
                            <div className="font-bold text-sm text-success">{m.powerOutput.toFixed(1)} <span className="font-normal text-xs">kW</span></div>
                        </div>
                        <div className="bg-base-200 rounded-lg p-2">
                            <div className="text-xs text-base-content/50">Wind</div>
                            <div className="font-bold text-sm text-info">{m.windSpeed.toFixed(1)} <span className="font-normal text-xs">m/s</span></div>
                        </div>
                        <div className="bg-base-200 rounded-lg p-2">
                            <div className="text-xs text-base-content/50">Rotor RPM</div>
                            <div className="font-bold text-sm">{m.rotorSpeed.toFixed(1)}</div>
                        </div>
                        <div className="bg-base-200 rounded-lg p-2">
                            <div className="text-xs text-base-content/50">Vibration</div>
                            <div className={`font-bold text-sm ${m.vibration > 5 ? "text-warning" : ""}`}>{m.vibration.toFixed(2)}</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-16 text-base-content/30 text-sm">
                        No data
                    </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                    {m && <span className="text-xs text-base-content/30">{new Date(m.timestamp).toLocaleTimeString()}</span>}
                    <span className="text-xs text-primary ml-auto">View details →</span>
                </div>
            </div>
        </Link>
    );
}
