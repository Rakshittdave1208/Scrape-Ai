export const architectureCategoryStyles = {
  client: {
    card: "border-blue-500/70 bg-blue-50 text-blue-950 dark:border-blue-500/50 dark:bg-slate-950 dark:text-blue-100",
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-400/30",
    minimap: "#2563eb",
    handle: "!bg-blue-500",
  },
  api: {
    card: "border-indigo-500/70 bg-indigo-50 text-indigo-950 dark:border-indigo-500/50 dark:bg-slate-950 dark:text-indigo-100",
    pill: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-200 dark:border-indigo-400/30",
    minimap: "#4338ca",
    handle: "!bg-indigo-500",
  },
  service: {
    card: "border-teal-600/70 bg-teal-50 text-teal-950 dark:border-teal-500/50 dark:bg-slate-950 dark:text-teal-100",
    pill: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-200 dark:border-teal-400/30",
    minimap: "#0f766e",
    handle: "!bg-teal-500",
  },
  infra: {
    card: "border-amber-500/70 bg-amber-50 text-amber-950 dark:border-amber-500/50 dark:bg-slate-950 dark:text-amber-100",
    pill: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30",
    minimap: "#d97706",
    handle: "!bg-amber-500",
  },
} as const;

export const architectureStatusStyles = {
  idle: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  running: "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/60 dark:text-blue-200",
  success: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-200",
  error: "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/60 dark:text-rose-200",
} as const;

export function formatCredits(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

type EdgePresentationOptions = {
  isActive?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
};

export function getArchitectureEdgePresentation({
  isActive,
  isHovered,
  isSelected,
}: EdgePresentationOptions) {
  if (isActive) {
    return {
      stroke: "#14b8a6",
      strokeWidth: 4.5,
      animated: true,
      labelColor: "#ccfbf1",
      labelBorder: "#2dd4bf",
      labelBackground: "rgba(15, 23, 42, 0.92)",
      dashArray: "8 5",
      dropShadow: "drop-shadow(0 0 10px rgba(20, 184, 166, 0.45))",
    };
  }

  if (isHovered || isSelected) {
    return {
      stroke: "#60a5fa",
      strokeWidth: 4,
      animated: true,
      labelColor: "#dbeafe",
      labelBorder: "#60a5fa",
      labelBackground: "rgba(15, 23, 42, 0.92)",
      dashArray: isSelected ? "0" : "7 5",
      dropShadow: "drop-shadow(0 0 8px rgba(96, 165, 250, 0.35))",
    };
  }

  return {
    stroke: "#94a3b8",
    strokeWidth: 3.2,
    animated: false,
    labelColor: "#e2e8f0",
    labelBorder: "rgba(148, 163, 184, 0.35)",
    labelBackground: "rgba(15, 23, 42, 0.82)",
    dashArray: "0",
    dropShadow: "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.18))",
  };
}
