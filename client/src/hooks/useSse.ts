import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {type Measurement, type Alert, WebClientClient} from "../generated-ts-client";
import {finalUrl} from "../baseUrl.ts";
import {customFetch} from "./customFetch.ts";
import {useAtom} from "jotai";
import {turbinesAtom} from "../atoms/atom.ts";

// Shared SSE client instance
const sseClient = new StateleSSEClient(`${finalUrl}/sse`);

const webClient = new WebClientClient(finalUrl, customFetch);

export function useMeasurementsSSE() {
    const [measurements, setMeasurements] = useState<Measurement[] | null>(null);
    const [, setTurbines] = useAtom(turbinesAtom);

    useEffect(() => {
        sseClient.listen(
            async (connectionId) => await webClient.getMeasurements(connectionId),
            (data) => {
                const ms = data ?? [];
                setMeasurements(ms);

                // Derive unique turbines from measurements
                const seen = new Map<string, string>();
                for (const m of ms) seen.set(m.turbineId, m.turbineName);
                setTurbines(Array.from(seen.entries()).map(([id, name]) => ({ id, name })));
            }
        );
    }, []);

    return measurements;
}

export function useAlertsSSE() {
    const [alerts, setAlerts] = useState<Alert[] | null>(null);

    useEffect(() => {
        sseClient.listen(
            async (connectionId) => {
                const result = await webClient.getAlerts(connectionId);
                return result;
            },
            (data) => {
                setAlerts(data ?? null);
            }
        );
    }, []);

    return alerts;
}

