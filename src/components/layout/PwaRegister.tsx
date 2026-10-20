"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registrado con éxito:", registration.scope);
          })
          .catch((err) => {
            console.warn("Fallo al registrar ServiceWorker:", err);
          });
      });
    }
  }, []);

  return null;
}
