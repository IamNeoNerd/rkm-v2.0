/**
 * Custom Error Page for Pages Router fallback
 * 
 * This file is needed because Next.js falls back to Pages Router
 * for generating the /404 static page during build. Without this,
 * the build fails with "Html should not be imported" error.
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';

function Error({ statusCode }: { statusCode?: number }) {
    const router = useRouter();

    // Redirect to App Router not-found page
    useEffect(() => {
        if (statusCode === 404) {
            router.replace('/');
        }
    }, [router, statusCode]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '24px',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>
                {statusCode ? `Error ${statusCode}` : 'An error occurred'}
            </h1>
            <p style={{ color: '#666' }}>
                {statusCode === 404
                    ? 'The page you were looking for could not be found.'
                    : 'An unexpected error occurred.'}
            </p>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
