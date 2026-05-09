import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/payments")({
  component: () => (
    <div className="glass-strong rounded-3xl p-10 text-center">
      <Sparkles className="mx-auto size-8 text-primary" />
      <h1 className="mt-3 font-display text-3xl font-bold">Payments</h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Log fees, upload bank-transfer proofs, and generate downloadable receipts.
      </p>
      <p className="mt-4 text-xs uppercase tracking-widest text-primary">Coming in next phase</p>
    </div>
  ),
});
