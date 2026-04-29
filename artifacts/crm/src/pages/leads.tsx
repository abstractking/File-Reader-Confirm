import { useState } from "react";
import { useListLeads, getListLeadsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { LeadStatusBadge, ScoreIndicator } from "@/components/ui/badges";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Leads() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Convert "all" to undefined for the API
  const apiStatus = statusFilter === "all" ? undefined : statusFilter as any;

  const { data, isLoading } = useListLeads(
    { status: apiStatus, limit: 50 },
    { query: { queryKey: getListLeadsQueryKey({ status: apiStatus, limit: 50 }) } }
  );

  const filteredLeads = data?.leads?.filter(lead => 
    search === "" || 
    lead.business_name.toLowerCase().includes(search.toLowerCase()) ||
    lead.niche?.toLowerCase().includes(search.toLowerCase()) ||
    lead.location?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your scouted prospects.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search leads by name, niche, or location..."
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading leads...</div>
          ) : filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Business</th>
                    <th className="px-6 py-4 font-medium">Niche & Location</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/leads/${lead.id}`} className="font-semibold text-foreground group-hover:text-primary">
                          {lead.business_name}
                        </Link>
                        {lead.website_url && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                            {lead.website_url}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.niche || "-"}</div>
                        <div className="text-xs text-muted-foreground">{lead.location || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <ScoreIndicator score={lead.score} />
                      </td>
                      <td className="px-6 py-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center border-dashed border-2 m-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">No leads found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or run a new scout batch.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
