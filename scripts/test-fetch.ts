
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

async function testFetch() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not set");
        process.exit(1);
    }

    const host = url.split('@')[1]?.split('/')[0];
    const httpsUrl = `https://${host}`;

    console.log(`Testing raw fetch to: ${httpsUrl}`);

    try {
        const controller = new AbortController();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(httpsUrl, {
            method: 'HEAD',
            signal: controller.signal
        });

        console.log(`Fetch returned status: ${response.status}`);
    } catch (err) {
        console.error("Fetch Failure Details:");
        console.error(err);
        if (err.cause) {
            console.error("Underlying Cause:", err.cause);
        }
    } finally {
        process.exit(0);
    }
}

testFetch();
