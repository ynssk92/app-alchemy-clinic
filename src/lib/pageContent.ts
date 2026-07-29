import * as Icons from "lucide-react";
import { HelpCircle, type LucideIcon } from "lucide-react";

import esthetique from "@/assets/soin-esthetique.jpg";
import implant from "@/assets/soin-implant.jpg";
import ortho from "@/assets/soin-ortho.jpg";
import visage from "@/assets/soin-visage.jpg";
import diagnostic from "@/assets/soin-diagnostic.jpg";

const bundled: Record<string, string> = {
  "soin-esthetique.jpg": esthetique,
  "soin-implant.jpg": implant,
  "soin-ortho.jpg": ortho,
  "soin-visage.jpg": visage,
  "soin-diagnostic.jpg": diagnostic,
};

/** Resolves a stored image path to a usable URL (supports bundled seed assets). */
export const resolveImage = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("/src/assets/")) return bundled[url.split("/").pop() as string];
  return url;
};

/** Resolves a stored lucide icon name to a component, with a safe fallback. */
export const resolveIcon = (name?: string | null): LucideIcon => {
  if (!name) return HelpCircle;
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon || HelpCircle;
};
