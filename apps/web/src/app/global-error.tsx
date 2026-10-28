'use client';

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the layout,
 * so it brings its own <html> and <body> and inline styles (globals.css may not load).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{ margin: 0, fontFamily: 'Georgia, serif', color: '#1c2b24', background: '#f5f1e8' }}
      >
        <main
          style={{ maxWidth: 520, margin: '18vh auto', padding: '0 20px', textAlign: 'center' }}
        >
          <p
            style={{ letterSpacing: 2, fontSize: 13, textTransform: 'uppercase', color: '#2c6a57' }}
          >
            Bay Book Company
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 500, margin: '12px 0', color: '#174236' }}>
            Something went wrong
          </h1>
          <p>The shop could not load. Please try again.</p>
          {error.digest && <p style={{ fontSize: 13, color: '#555' }}>Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              padding: '14px 36px',
              border: 0,
              borderRadius: 4,
              background: '#174236',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
