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

export function getArchitectureCategoryLabel(category: string) {
  if (category === "infra") {
    return "Cloud Infra";
  }

  if (category === "api") {
    return "API";
  }

  if (category === "client") {
    return "Client";
  }

  if (category === "service") {
    return "Service";
  }

  return category;
}

type EdgePresentationOptions = {
  isActive?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  theme?: "light" | "dark";
};

export function getArchitectureEdgePresentation({
  isActive,
  isHovered,
  isSelected,
  theme = "light",
}: EdgePresentationOptions) {
  const isDark = theme === "dark";

  if (isActive) {
    return {
      stroke: isDark ? "#2dd4bf" : "#0f766e",
      strokeWidth: 4.5,
      animated: true,
      labelColor: isDark ? "#ccfbf1" : "#042f2e",
      labelBorder: isDark ? "#2dd4bf" : "#14b8a6",
      labelBackground: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(240, 253, 250, 0.94)",
      dashArray: "8 5",
      dropShadow: isDark
        ? "drop-shadow(0 0 10px rgba(20, 184, 166, 0.45))"
        : "drop-shadow(0 4px 10px rgba(13, 148, 136, 0.18))",
    };
  }

  if (isHovered || isSelected) {
    return {
      stroke: isDark ? "#60a5fa" : "#2563eb",
      strokeWidth: 4,
      animated: true,
      labelColor: isDark ? "#dbeafe" : "#1e3a8a",
      labelBorder: isDark ? "#60a5fa" : "#3b82f6",
      labelBackground: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(239, 246, 255, 0.96)",
      dashArray: isSelected ? "0" : "7 5",
      dropShadow: isDark
        ? "drop-shadow(0 0 8px rgba(96, 165, 250, 0.35))"
        : "drop-shadow(0 4px 10px rgba(37, 99, 235, 0.16))",
    };
  }

  return {
    stroke: isDark ? "#94a3b8" : "#64748b",
    strokeWidth: 3.2,
    animated: false,
    labelColor: isDark ? "#e2e8f0" : "#334155",
    labelBorder: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(100, 116, 139, 0.24)",
    labelBackground: isDark ? "rgba(15, 23, 42, 0.82)" : "rgba(248, 250, 252, 0.98)",
    dashArray: "0",
    dropShadow: isDark
      ? "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.18))"
      : "drop-shadow(0 3px 8px rgba(15, 23, 42, 0.08))",
  };
}
