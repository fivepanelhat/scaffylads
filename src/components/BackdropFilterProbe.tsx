"use client";

import { useEffect } from "react";

/**
 * Super Grok diagnostic from Scaffylad.txt:
 * Injects a fixed red square using backdrop-filter.
 * If the square is missing, backdrop-filter is broken on this machine.
 *
 * Enable with ?fxdebug=1 on any page, or NEXT_PUBLIC_FX_DEBUG=1.
 */
export function BackdropFilterProbe() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const enabled =
      params.get("fxdebug") === "1" ||
      process.env.NEXT_PUBLIC_FX_DEBUG === "1";
    if (!enabled) return;

    const d = document.createElement("div");
    d.id = "scaffylads-fx-probe";
    d.style.cssText =
      "position:fixed;top:0;left:0;width:50px;height:50px;background:red;backdrop-filter:blur(4px);z-index:9999";
    document.body.appendChild(d);
    // eslint-disable-next-line no-console
    console.log(
      "ScaffyLads FX probe: Do you see a red square top-left? If not, backdrop-filter is broken on this machine.",
    );

    return () => {
      d.remove();
    };
  }, []);

  return null;
}
