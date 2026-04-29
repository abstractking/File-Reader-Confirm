import { Badge } from "@/components/ui/badge";

export function LeadStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    qualified: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
    converted: "bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200",
  };

  const className = variants[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={`${className} font-medium capitalize`}>
      {status}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-blue-100 text-blue-800 border-blue-200",
    on_hold: "bg-amber-100 text-amber-800 border-amber-200",
    complete: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const className = variants[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={`${className} font-medium capitalize`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const variants: Record<string, string> = {
    PROPOSAL: "bg-blue-100 text-blue-800 border-blue-200",
    DESIGN: "bg-violet-100 text-violet-800 border-violet-200",
    BUILD: "bg-orange-100 text-orange-800 border-orange-200",
    LAUNCH: "bg-teal-100 text-teal-800 border-teal-200",
    MARKET: "bg-purple-100 text-purple-800 border-purple-200",
    COMPLETE: "bg-green-100 text-green-800 border-green-200",
  };

  const className = variants[stage] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={`${className} font-medium`}>
      {stage}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    awaiting_approval: "bg-purple-100 text-purple-800 border-purple-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    complete: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };

  const className = variants[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <Badge variant="outline" className={`${className} font-medium capitalize`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function ScoreIndicator({ score }: { score: number }) {
  let color = "bg-red-500";
  if (score >= 80) color = "bg-green-500";
  else if (score >= 50) color = "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono font-medium">{score}</span>
    </div>
  );
}
