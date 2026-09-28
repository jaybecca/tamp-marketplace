"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("TAMP Marketplace application error", { message: error.message, digest: error.digest });
    void fetch("/api/monitoring/client-error", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: error.message, digest: error.digest, path: window.location.pathname, language: document.documentElement.lang }) }).catch(() => undefined);
  }, [error]);

  return (
    <main id="main-content" style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "4rem 1.5rem" }}>
      <section style={{ maxWidth: 620, textAlign: "center" }}>
        <p style={{ fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>TAMP Marketplace</p>
        <h1>Something went wrong.</h1>
        <p>Please try again. If the problem continues, contact TAMP Marketplace support.</p>
        <button type="button" onClick={() => reset()}>Try again</button>
      </section>
    </main>
  );
}
