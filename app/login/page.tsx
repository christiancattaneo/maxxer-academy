"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: ".5rem",
            letterSpacing: "-.5px",
          }}
        >
          Maxxer{" "}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: ".7rem",
              fontWeight: 600,
              background: "#fff",
              color: "#0a0a0f",
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: ".05em",
              verticalAlign: "middle",
            }}
          >
            Academy
          </span>
        </div>

        <p
          style={{
            color: "#94a3b8",
            fontSize: ".9rem",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          Access restricted to Alpha School and Super Builders students
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.3)",
              borderRadius: 10,
              padding: ".8rem 1rem",
              marginBottom: "1.5rem",
              color: "#fca5a5",
              fontSize: ".85rem",
              lineHeight: 1.5,
            }}
          >
            Access denied — only @alpha.school and @superbuilders.school emails
            are allowed
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/tools" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".6rem",
            padding: "12px 28px",
            background: "#fff",
            color: "#0a0a0f",
            border: "none",
            borderRadius: 100,
            fontWeight: 600,
            fontSize: ".9rem",
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "all .2s",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.transform =
              "translateY(-1px)";
            (e.target as HTMLButtonElement).style.boxShadow =
              "0 4px 20px rgba(255,255,255,.15)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            (e.target as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <p
          style={{
            color: "#475569",
            fontSize: ".75rem",
            marginTop: "2rem",
            lineHeight: 1.5,
          }}
        >
          By signing in you agree to the Maxxer Academy terms of use
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
