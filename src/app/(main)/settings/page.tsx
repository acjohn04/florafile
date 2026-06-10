"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { useTranslation } from "@/i18n/client";
import { ManageLocations } from "./ManageLocations";

// ─── Settings Page ─────────────────────────────────────────────────────────────
// Displays the user's household ID (for sharing) and lets them join another
// household by pasting an existing household ID.

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<"idle" | "success" | "error">("idle");

  // Fetch the current household ID on mount
  useEffect(() => {
    fetch("/api/household")
      .then((r) => r.json())
      .then((data) => {
        if (data.householdId) setHouseholdId(data.householdId);
      })
      .catch(console.error);
  }, []);

  // Copy household ID to clipboard
  const handleCopy = async () => {
    if (!householdId) return;
    try {
      await navigator.clipboard.writeText(householdId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = householdId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Join a different household by ID
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;
    setJoining(true);
    setJoinStatus("idle");

    try {
      const res = await fetch("/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdId: joinInput.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setHouseholdId(data.householdId);
        setJoinInput("");
        setJoinStatus("success");
      } else {
        setJoinStatus("error");
      }
    } catch {
      setJoinStatus("error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <header>
        <h1 className="text-3xl font-heading font-bold text-on-surface">{t.settings.title}</h1>
      </header>

      {/* ── Profile card ──────────────────────────────────────── */}
      <section className="bg-surface-container-low rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-on-surface">{t.settings.profileTitle}</h2>
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-on-primary-container">
              {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            {session?.user?.name && (
              <p className="font-semibold text-on-surface">{session.user.name}</p>
            )}
            {session?.user?.email && (
              <p className="text-sm text-on-surface-variant">{session.user.email}</p>
            )}
          </div>
        </div>

        <button
          id="settings-sign-out"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm font-medium text-error hover:bg-error/10 px-4 py-2 rounded-full transition-colors cursor-pointer"
        >
          <Icon name="logout" className="text-[18px]" />
          {t.settings.signOut}
        </button>
      </section>

      {/* ── Household ID card ─────────────────────────────────── */}
      <section className="bg-surface-container-low rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-on-surface">{t.settings.householdTitle}</h2>
        <p className="text-sm text-on-surface-variant">{t.settings.householdIdDesc}</p>

        <div className="flex items-stretch gap-3">
          {/* ID display pill */}
          <div
            id="settings-household-id"
            className="flex-1 bg-surface-container rounded-2xl px-4 py-3 font-mono text-sm text-on-surface-variant break-all select-all"
          >
            {householdId ?? "Loading…"}
          </div>

          {/* Copy button */}
          <button
            id="settings-copy-household-id"
            onClick={handleCopy}
            disabled={!householdId}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 rounded-2xl font-medium text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Icon name={copied ? "check" : "content_copy"} className="text-[18px]" />
            {copied ? t.settings.copiedButton : t.settings.copyButton}
          </button>
        </div>
      </section>

      {/* ── Join a household card ──────────────────────────────── */}
      <section className="bg-surface-container-low rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-heading font-semibold text-on-surface">{t.settings.joinTitle}</h2>
        <p className="text-sm text-on-surface-variant">{t.settings.joinDesc}</p>

        <form id="settings-join-form" onSubmit={handleJoin} className="space-y-3">
          <input
            id="settings-join-input"
            type="text"
            value={joinInput}
            onChange={(e) => {
              setJoinInput(e.target.value);
              setJoinStatus("idle");
            }}
            placeholder={t.settings.joinPlaceholder}
            className="w-full bg-surface-container rounded-2xl px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          {/* Feedback messages */}
          {joinStatus === "success" && (
            <p className="text-sm text-primary flex items-center gap-1">
              <Icon name="check_circle" className="text-[16px]" />
              {t.settings.joinSuccess}
            </p>
          )}
          {joinStatus === "error" && (
            <p className="text-sm text-error flex items-center gap-1">
              <Icon name="error" className="text-[16px]" />
              {t.settings.joinError}
            </p>
          )}

          <button
            id="settings-join-button"
            type="submit"
            disabled={joining || !joinInput.trim()}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-medium text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Icon name={joining ? "autorenew" : "group_add"} className={`text-[18px] ${joining ? "animate-spin" : ""}`} />
            {joining ? t.settings.joiningButton : t.settings.joinButton}
          </button>
        </form>
      </section>

      {/* ── Manage Locations card ──────────────────────────────── */}
      <ManageLocations />
    </div>
  );
}
