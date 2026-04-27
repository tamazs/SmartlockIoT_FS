import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import type {Measurement} from "../../generated-ts-client.ts";

interface MetricChartProps {
    data: Measurement[];
    metric: keyof Pick<Measurement, "powerOutput" | "windSpeed" | "rotorSpeed" | "generatorTemp" | "gearboxTemp" | "vibration" | "bladePitch">;
    label: string;
    unit: string;
    color?: string;
    type?: "line" | "area";
}

function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MetricChart({ data, metric, label, unit, color = "#570df8", type = "area" }: MetricChartProps) {
    const chartData = data.map((m) => ({
        time: formatTime(m.timestamp),
        fullTime: new Date(m.timestamp).toLocaleString(),  // for tooltip
        value: Number((m[metric] as number).toFixed(2)),
    }));

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <span className="text-xs text-base-content/40 badge badge-ghost">{unit}</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    {type === "area" ? (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTime ?? ""}
                                formatter={(v: number | undefined) => [`${v} ${unit}`, label]}
                            />
                            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${metric})`} dot={false} />
                        </AreaChart>
                    ) : (
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                            <Tooltip
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                formatter={(v: number | undefined) => [`${v} ${unit}`, label]}
                            />
                            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function TemperatureChart({ data }: { data: Measurement[] }) {
    const chartData = data.map((m) => ({
        time: formatTime(m.timestamp),
        fullTime: new Date(m.timestamp).toLocaleString(),
        generator: Number(m.generatorTemp.toFixed(1)),
        gearbox: Number(m.gearboxTemp.toFixed(1)),
        ambient: Number(m.ambientTemperature.toFixed(1)),
    }));

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4">
                <h3 className="font-semibold text-sm mb-3">Temperature Overview</h3>
                <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} unit="°C" />
                        <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTime ?? ""}
                            formatter={(v: number | undefined, name: string | undefined) => [`${v}°C`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="generator" name="Generator" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="gearbox" name="Gearbox" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="ambient" name="Ambient" stroke="#6b7280" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
