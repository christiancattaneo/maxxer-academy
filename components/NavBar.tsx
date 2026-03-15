"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: session } = useSession();

  return (
    <nav>
      <div className="nav-inner">
        <a className="nav-logo" href="/">
          Maxxer <span className="nav-badge">Academy</span>
        </a>
        <div className="nav-links">
          <Link href="/tools" style={{ fontSize: ".85rem", color: "var(--ink-2)", textDecoration: "none", fontWeight: 500 }}>
            Tools
          </Link>
          {session?.user ? (
            <>
              <span style={{ fontSize: ".78rem", color: "var(--ink-3)", fontFamily: "var(--mono)" }}>
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                style={{
                  fontSize: ".8rem",
                  fontWeight: 600,
                  padding: "7px 16px",
                  borderRadius: "100px",
                  background: "transparent",
                  color: "var(--ink-2)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="nav-cta">
              Sign In
            </Link>
          )}
          <a
            className="nav-cta"
            href="https://alphahigh.school"
            target="_blank"
            rel="noopener"
          >
            Alpha Founders ↗
          </a>
        </div>
      </div>
    </nav>
  );
}
