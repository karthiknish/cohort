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
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#fafafa",
        }}
      >
        <h2
          style={{
            marginBottom: "16px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1a1a1a",
          }}
        >
          Something went wrong!
        </h2>
        <p
          style={{
            marginBottom: "24px",
            color: "#666",
            maxWidth: "400px",
          }}
        >
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
