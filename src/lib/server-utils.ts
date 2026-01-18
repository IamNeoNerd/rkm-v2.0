
import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string) {
    try {
        revalidatePath(path);
    } catch (error) {
        // Suppress error in test/script environments
        if (error instanceof Error && error.message?.includes("store missing")) {
            return;
        }
        throw error;
    }
}
