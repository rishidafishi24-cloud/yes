import { CompanyEventV1, renderCompanyEventNarrative } from "@paperclipai/shared";
import { cn } from "@/lib/utils";

export interface NarrativeEventRowProps {
  event: CompanyEventV1;
}

export function NarrativeEventRow({ event }: NarrativeEventRowProps) {
  const narrative = renderCompanyEventNarrative(event);

  return (
    <li className="px-4 py-3 text-sm border-b border-border">
      <p className="text-foreground">{narrative}</p>
    </li>
  );
}