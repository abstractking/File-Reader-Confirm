import { useRoute, Link } from "wouter";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge, StageBadge, TaskStatusBadge } from "@/components/ui/badges";
import { formatDate } from "@/lib/format";
import { ArrowLeft, User, Mail, Calendar, Briefcase, ExternalLink, Code } from "lucide-react";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const id = params?.id || "";

  const { data, isLoading } = useGetProject(id, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) }
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading project details...</div>;
  }

  if (!data || !data.project) {
    return <div className="p-8 text-center text-destructive">Project not found.</div>;
  }

  const { project, tasks, lead } = data;

  const STAGES = ["PROPOSAL", "DESIGN", "BUILD", "LAUNCH", "MARKET", "COMPLETE"];
  const currentStageIndex = STAGES.indexOf(project.current_stage);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/projects">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{project.project_name}</h1>
            <ProjectStatusBadge status={project.status} />
            <StageBadge stage={project.current_stage} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Started on {formatDate(project.created_at)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Client
                </div>
                <div className="text-sm pl-6">{project.client_name}</div>
              </div>
              {project.client_email && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Email
                  </div>
                  <div className="text-sm pl-6">
                    <a href={`mailto:${project.client_email}`} className="text-primary hover:underline">
                      {project.client_email}
                    </a>
                  </div>
                </div>
              )}
              {project.niche && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> Niche
                  </div>
                  <div className="text-sm pl-6">{project.niche}</div>
                </div>
              )}
              {project.deadline && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> Deadline
                  </div>
                  <div className="text-sm pl-6">{formatDate(project.deadline)}</div>
                </div>
              )}
              {project.tech_stack && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" /> Tech Stack
                  </div>
                  <div className="text-sm pl-6">{project.tech_stack}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pt-2 pb-6 px-4">
                <div className="absolute top-5 left-8 right-8 h-1 bg-muted rounded-full" />
                <div 
                  className="absolute top-5 left-8 h-1 bg-primary rounded-full transition-all" 
                  style={{ width: `calc(${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}% - 1rem)` }}
                />
                
                <div className="flex justify-between relative z-10">
                  {STAGES.map((stage, i) => {
                    const isCompleted = i < currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    
                    return (
                      <div key={stage} className="flex flex-col items-center gap-2 w-16">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-medium bg-background transition-colors
                          ${isCompleted ? 'border-primary text-primary bg-primary/10' : 
                            isCurrent ? 'border-primary bg-primary text-primary-foreground' : 
                            'border-muted text-muted-foreground'}`
                        }>
                          {i + 1}
                        </div>
                        <div className={`text-[10px] font-medium text-center ${
                          isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {stage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tasks && tasks.length > 0 ? (
                <div className="divide-y border-t">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-muted/30">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {task.task_type}
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                          <span>Agent: {task.agent}</span>
                          <span>Priority: {task.priority}</span>
                          <span>Updated: {formatDate(task.updated_at)}</span>
                        </div>
                        {task.error_log && (
                          <div className="text-xs text-red-500 mt-2 p-2 bg-red-500/10 rounded font-mono">
                            {task.error_log}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground italic border-t">
                  No tasks have been created for this project yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {lead && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Linked Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">{lead.business_name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Converted from pipeline</div>
                </div>
                <Link href={`/leads/${lead.id}`}>
                  <Button variant="outline" className="w-full justify-between">
                    View Lead Profile
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {project.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md border">
                  {project.notes}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
