import { getAllSessions } from "@/actions/session";
import SessionsClient from "./sessions-client";

export const dynamic = 'force-dynamic';

export default async function SessionsSettingsPage() {
    const result = await getAllSessions();
    const sessions = result.success && result.sessions ? result.sessions : [];

    return <SessionsClient initialSessions={sessions as any} />;
}
