"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{navigator.sendBeacon&&navigator.sendBeacon('/api/monitoring/client-error',new Blob([JSON.stringify({message:${JSON.stringify("Global application error")},digest:${JSON.stringify("global")},path:location.pathname,language:document.documentElement.lang||'en'})],{type:'application/json'}))}catch(e){}})()` }} />
        <main id="main-content" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <section style={{ maxWidth: 620, textAlign: "center" }}>
            <h1>TAMP Marketplace</h1>
            <h2>We hit an unexpected error.</h2>
            <p>Please try again.</p>
            <button type="button" onClick={() => reset()}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
