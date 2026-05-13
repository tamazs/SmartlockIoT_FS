import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import { type Log, type Alert, WebClientClient } from "../generated-ts-client";
import { finalUrl } from "../baseUrl.ts";
import { customFetch } from "./customFetch.ts";

const sseClient = new StateleSSEClient(`${finalUrl}/sse`);
const webClient = new WebClientClient(finalUrl, customFetch);

export function useLogsSSE() {
    const [logs, setLogs] = useState<Log[] | null>(null);

    useEffect(() => {
        return sseClient.listen<Log[]>(
            async (connectionId) => await webClient.getLogs(connectionId),
            (data) => { setLogs(data); }
        );
    }, []);

    return logs;
}

export function useAlertsSSE() {
    const [alerts, setAlerts] = useState<Alert[] | null>(null);

    useEffect(() => {
        return sseClient.listen<Alert[]>(
            async (connectionId) => await webClient.getAlerts(connectionId),
            (data) => { setAlerts(data); }
        );
    }, []);

    return alerts;
}
