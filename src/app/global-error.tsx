"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      navigator.sendBeacon(
        "/api/monitoring/client-error",
        new Blob(
          [
            JSON.stringify({
              message: "Global application error",
              digest: error.digest ?? "global",
              path: window.location.pathname,
              language: document.documentElement.lang || "en",
            }),
          ],
          { type: "application/json" },
        ),
      );
    } catch {
      // Error reporting must never prevent the error page from rendering.
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          id="main-content"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <section style={{ maxWidth: 620, textAlign: "center" }}>
            <h1>TAMP Marketplace</h1>
            <h2>We hit an unexpected error.</h2>
            <p>Please try again.</p>
            <button type="button" onClick={() => reset()}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
