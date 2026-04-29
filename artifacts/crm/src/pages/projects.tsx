import { useState } from "react";
import { useListProjects, getListProjectsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ProjectStatusBadge, StageBadge } from "@/components/ui/badges";
import { formatDate, formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Projects() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const apiStatus = statusFilter === "all" ? undefined : statusFilter as any;

  const { data, isLoading } = useListProjects(
    { status: apiStatus, limit: 50 },
    { query: { queryKey: getListProjectsQueryKey({ status: apiStatus, limit: 50 }) } }
  );

  const filteredProjects = data?.projects?.filter(project => 
    search === "" || 
    project.project_name.toLowerCase().includes(search.toLowerCase()) ||
    project.client_name.toLowerCase().includes(search.toLowerCase()) ||
    project.niche?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Track ongoing website builds and deliveries.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects or clients..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading projects...</div>
          ) : filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${project.id}`} className="font-semibold text-foreground group-hover:text-primary block mb-0.5">
                          {project.project_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{project.tech_stack || "Unknown Stack"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{project.client_name}</div>
                        {project.niche && <div className="text-xs text-muted-foreground">{project.niche}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <StageBadge stage={project.current_stage} />
                      </td>
                      <td className="px-6 py-4">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium">{formatCurrency(project.price)}</div>
                        {project.package && <div className="text-xs text-muted-foreground">{project.package} pkg</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center border-dashed border-2 m-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">No projects found</h3>
              <p className="text-muted-foreground">Convert a lead to create a project.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
