"use client";

/**
 * Runs during HTML parsing on full page loads. On the client React renders it as
 * text/plain, which keeps React from warning about script tags in components.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
