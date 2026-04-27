interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    color?: "primary" | "success" | "warning" | "error" | "info";
}

export default function StatCard({ label, value, unit, icon, color = "primary" }: StatCardProps) {
    const colorMap = {
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
    };

    return (
        <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wider font-medium">{label}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className={`text-2xl font-bold ${colorMap[color]}`}>{value}</span>
                            {unit && <span className="text-sm text-base-content/50">{unit}</span>}
                        </div>
                    </div>
                    {icon && (
                        <div className={`${colorMap[color]} opacity-80`}>
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
