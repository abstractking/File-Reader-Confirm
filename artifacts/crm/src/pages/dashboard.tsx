import { useGetCrmStats, getGetCrmStatsQueryKey, useListLeads, useListTasks, useListActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, AlertTriangle, Briefcase, ArrowRight } from "lucide-react";
import { LeadStatusBadge, TaskStatusBadge } from "@/components/ui/badges";
import { formatDate, formatDateTime } from "@/lib/format";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetCrmStats({
    query: { refetchInterval: 30000, queryKey: getGetCrmStatsQueryKey() }
  });
  
  const { data: leadsData } = useListLeads({ limit: 10 });
  const { data: tasksData } = useListTasks({ limit: 10 });
  const { data: activityData } = useListActivity({ limit: 20 });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your agency's pipeline and operations.</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.leads.new} new
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads.qualified}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.leads.converted} converted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Of {stats.projects.total} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks.pending + stats.tasks.in_progress}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across pipeline
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasks.awaiting_approval}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Check Slack
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link href="/leads" className="text-sm text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {leadsData?.leads && leadsData.leads.length > 0 ? (
              <div className="space-y-4">
                {leadsData.leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div>
                      <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">{lead.business_name}</Link>
                      <div className="text-sm text-muted-foreground">{lead.niche} &bull; {lead.location}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-mono">Score: {lead.score}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(lead.created_at)}</div>
                      </div>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No leads yet. Run a scout batch from Slack to get started.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Activity Feed</CardTitle>
            <Link href="/activity" className="text-sm text-primary flex items-center gap-1 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px] pr-2">
            {activityData?.activity && activityData.activity.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
                {activityData.activity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-background bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                      <div className={`w-2 h-2 rounded-full ${activity.status === 'error' ? 'bg-red-500' : activity.status === 'warning' ? 'bg-amber-500' : 'bg-primary'}`}></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-xs text-primary">{activity.agent}</div>
                        <div className="text-[10px] text-muted-foreground">{formatDateTime(activity.created_at)}</div>
                      </div>
                      <div className="text-sm">{activity.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          <Link href="/tasks" className="text-sm text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {tasksData?.tasks && tasksData.tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Task</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksData.tasks.slice(0, 5).map(task => (
                    <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{task.task_type}</td>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${task.project_id}`} className="hover:underline">
                          {task.project_name || (task.project_id ? task.project_id.substring(0, 8) : "—")}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{task.agent}</td>
                      <td className="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(task.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              No tasks found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
