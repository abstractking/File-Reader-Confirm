import { useListActivity, getListActivityQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { Activity as ActivityIcon, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function Activity() {
  const { data, isLoading } = useListActivity(
    { limit: 200 },
    { query: { queryKey: getListActivityQueryKey({ limit: 200 }) } }
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">Complete system audit trail of agent operations.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading activity log...</div>
          ) : data?.activity && data.activity.length > 0 ? (
            <div className="divide-y">
              {data.activity.map((entry) => {
                const isError = entry.status === "error";
                const isWarning = entry.status === "warning";
                const isSuccess = entry.status === "success";

                return (
                  <div key={entry.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                    <div className="mt-1">
                      {isError ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : isWarning ? (
                        <Info className="h-5 w-5 text-amber-500" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <ActivityIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="font-medium text-sm">
                          <span className="font-mono text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground mr-2">
                            {entry.agent}
                          </span>
                          {entry.action}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(entry.created_at)}
                        </div>
                      </div>
                      
                      {entry.project_id && (
                        <div className="text-xs text-muted-foreground pt-1">
                          Project: <Link href={`/projects/${entry.project_id}`} className="hover:underline text-primary">{entry.project_id}</Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground border-dashed border-2 m-4 rounded-lg">
              No activity recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
