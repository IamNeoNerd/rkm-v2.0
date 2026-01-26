"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{
                margin: 0,
                padding: '24px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    <h1 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>System Error</h1>
                    <p style={{ marginBottom: '24px', color: '#64748b' }}>A critical system error occurred. Please try to re-initialize the node.</p>
                    <button
                        onClick={() => reset()}
                        style={{
                            backgroundColor: '#0f172a',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                    <div style={{ marginTop: '16px', fontSize: '10px', color: '#94a3b8' }}>
                        Error Digest: {error.digest || 'None'}
                    </div>
                </div>
            </body>
        </html>
    );
}
