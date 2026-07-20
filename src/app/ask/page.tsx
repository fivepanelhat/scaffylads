import { PageHeader } from "@/components/PageHeader";
import { AskScaffyClient } from "./AskScaffyClient";

export const metadata = {
  title: "Ask Scaffy · ScaffyLads",
  description:
    "Natural language questions over your scaffolding journal — multimodal text and voice.",
};

export default function AskPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Ask Scaffy"
        title="Natural language over your journal"
        lead="Type or speak. Offline answers use local projects, shifts, and logs. Live mode is opt-in via SpaceXAI and always labelled."
      />
      <AskScaffyClient />
    </div>
  );
}
