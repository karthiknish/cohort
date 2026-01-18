"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "24px", fontWeight: "bold" }}>Something went wrong!</h2>
        <button
          onClick={() => reset()}
          style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#3b82f6", color: "white", border: "none", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
