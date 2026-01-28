import { getAllSessions } from "@/actions/session";
import SessionsClient from "./sessions-client";

export const dynamic = 'force-dynamic';

export default async function SessionsSettingsPage() {
    const result = await getAllSessions();
    const sessions = result.success && result.sessions ? result.sessions : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <SessionsClient initialSessions={sessions as any} />;
}
