export const architectureCategoryStyles = {
  client: {
    card: "border-blue-500/70 bg-blue-50 text-blue-950",
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    minimap: "#2563eb",
    handle: "!bg-blue-500",
  },
  api: {
    card: "border-indigo-500/70 bg-indigo-50 text-indigo-950",
    pill: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    minimap: "#4338ca",
    handle: "!bg-indigo-500",
  },
  service: {
    card: "border-teal-600/70 bg-teal-50 text-teal-950",
    pill: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    minimap: "#0f766e",
    handle: "!bg-teal-500",
  },
  infra: {
    card: "border-amber-500/70 bg-amber-50 text-amber-950",
    pill: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    minimap: "#d97706",
    handle: "!bg-amber-500",
  },
} as const;

export const architectureStatusStyles = {
  idle: "border-slate-300 bg-slate-100 text-slate-700",
  running: "border-blue-300 bg-blue-100 text-blue-700",
  success: "border-emerald-300 bg-emerald-100 text-emerald-700",
  error: "border-rose-300 bg-rose-100 text-rose-700",
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
      stroke: "#0f766e",
      strokeWidth: 3,
      animated: true,
      labelColor: "#0f172a",
      labelBorder: "#99f6e4",
    };
  }

  if (isHovered || isSelected) {
    return {
      stroke: "#2563eb",
      strokeWidth: 3,
      animated: true,
      labelColor: "#1e3a8a",
      labelBorder: "#bfdbfe",
    };
  }

  return {
    stroke: "#64748b",
    strokeWidth: 2,
    animated: false,
    labelColor: "#334155",
    labelBorder: "#e2e8f0",
  };
}
