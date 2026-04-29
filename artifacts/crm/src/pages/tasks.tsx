import { useState } from "react";
import { useListTasks, getListTasksQueryKey, useRetriggerTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { TaskStatusBadge } from "@/components/ui/badges";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const apiStatus = statusFilter === "all" ? undefined : statusFilter;

  const { data, isLoading } = useListTasks(
    { status: apiStatus, limit: 100 },
    { query: { queryKey: getListTasksQueryKey({ status: apiStatus, limit: 100 }) } }
  );

  const retriggerTask = useRetriggerTask({
    mutation: {
      onSuccess: () => {
        toast({ title: "Task re-queued", description: "The task has been successfully restarted." });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ status: apiStatus, limit: 100 }) });
      },
      onError: (err: any) => {
        toast({ 
          title: "Failed to restart task", 
          description: err?.message || "An unknown error occurred.", 
          variant: "destructive" 
        });
      }
    }
  });

  const filteredTasks = data?.tasks?.filter(task => 
    search === "" || 
    task.task_type.toLowerCase().includes(search.toLowerCase()) ||
    task.agent.toLowerCase().includes(search.toLowerCase()) ||
    task.project_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Monitor background agent activities and intervene if needed.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks, agents, or projects..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tasks...</div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Task & Agent</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions / Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTasks.map((task) => {
                    const isFailedOrRejected = task.status === "failed" || task.status === "rejected";
                    return (
                      <tr key={task.id} className={`transition-colors group ${isFailedOrRejected ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-muted/30'}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{task.task_type}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{task.agent} &bull; Pri: {task.priority}</div>
                          {task.error_log && (
                            <div className="mt-2 text-xs text-red-600 flex items-start gap-1 max-w-xs">
                              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                              <span className="truncate" title={task.error_log}>{task.error_log}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/projects/${task.project_id}`} className="font-medium hover:underline text-primary">
                            {task.project_name || task.project_id.substring(0, 8)}
                          </Link>
                          {task.client_name && <div className="text-xs text-muted-foreground">{task.client_name}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <TaskStatusBadge status={task.status} />
                          {task.retries > 0 && <div className="text-xs text-muted-foreground mt-1">Retries: {task.retries}</div>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isFailedOrRejected ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mb-1"
                              onClick={() => retriggerTask.mutate({ id: task.id })}
                              disabled={retriggerTask.isPending}
                            >
                              <RefreshCw className={`h-3 w-3 mr-2 ${retriggerTask.isPending ? 'animate-spin' : ''}`} />
                              Retry
                            </Button>
                          ) : null}
                          <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                            {formatDate(task.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center border-dashed border-2 m-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">No tasks found</h3>
              <p className="text-muted-foreground">Agents are currently idle.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
