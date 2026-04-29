import { useRoute, Link } from "wouter";
import { useGetLead, getGetLeadQueryKey, useUpdateLead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge, ScoreIndicator } from "@/components/ui/badges";
import { formatDate } from "@/lib/format";
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Briefcase, Globe, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LeadDetail() {
  const [, params] = useRoute("/leads/:id");
  const id = params?.id || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lead, isLoading } = useGetLead(id, {
    query: { enabled: !!id, queryKey: getGetLeadQueryKey(id) }
  });

  const updateStatus = useUpdateLead({
    mutation: {
      onSuccess: (updatedLead) => {
        queryClient.setQueryData(getGetLeadQueryKey(id), updatedLead);
        toast({ title: "Status updated", description: `Lead status is now ${updatedLead.status}` });
      }
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="p-8 text-center text-destructive">Lead not found.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/leads">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{lead.business_name}</h1>
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            Added on {formatDate(lead.created_at)} &bull; Source: {lead.source}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.contact_name && (
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-md"><Users className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium">Contact Person</div>
                    <div className="text-sm text-muted-foreground">{lead.contact_name}</div>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-md"><Mail className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email}</a>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-md"><Phone className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <a href={`tel:${lead.phone}`} className="text-sm text-primary hover:underline">{lead.phone}</a>
                  </div>
                </div>
              )}
              {lead.website_url && (
                <div className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-md"><Globe className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium">Website</div>
                    <a href={lead.website_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      {lead.website_url} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.notes ? (
                <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-md border">
                  {lead.notes}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No notes available.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Overall Score</div>
                <ScoreIndicator score={lead.score} />
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Niche</div>
                    <div className="text-sm font-medium">{lead.niche || "Unknown"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium">{lead.location || "Unknown"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => updateStatus.mutate({ id, data: { status: "qualified" } })}
                disabled={lead.status === "qualified" || updateStatus.isPending}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                Mark as Qualified
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => updateStatus.mutate({ id, data: { status: "rejected" } })}
                disabled={lead.status === "rejected" || updateStatus.isPending}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Mark as Rejected
              </Button>
              {lead.status === "converted" && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">This lead has been converted to a project.</p>
                  <Link href={`/projects`}>
                    <Button variant="default" className="w-full">
                      View Projects
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
