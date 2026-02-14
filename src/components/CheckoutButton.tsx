"use client";

import { useState } from "react";

type Props = {
  beatId: string;
};

export function CheckoutButton({ beatId }: Props) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId })
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Could not start checkout. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn" onClick={startCheckout} disabled={loading}>
      {loading ? "Redirecting..." : "Buy License"}
    </button>
  );
}
