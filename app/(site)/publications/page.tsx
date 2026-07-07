import type { Metadata } from "next";
import ResearchPageContent from "@/components/ResearchPageContent";

export const metadata: Metadata = {
  title: "Research",
  description: "Investment research, publications, and market insights from ICUnpar.",
};

export default function PublicationsPage() {
  return <ResearchPageContent />;
}
