import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Bug, CheckCircle, RotateCcw, Save } from "lucide-react";
import { getIssues, getImportedScripts, updateIssue, Issue, ImportedScript } from "@/lib/storage";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImageViewer } from "@/components/ImageViewer";

export default function IssueLog() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [scripts, setScripts] = useState<ImportedScript[]>([]);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = () => {
    if (!projectId) return;
    
    setIssues(getIssues(projectId));
    setScripts(getImportedScripts(projectId));
  };

  const getScriptNames = (scriptIds: string[]) => {
    return scriptIds.map(id => {
      const script = scripts.find(s => s.id === id);
      return script ? script.script.scriptId : 'Unknown Script';
    }).join(', ');
  };

  const handleStatusChange = (issueId: string, newStatus: 'fixed' | 'reopened') => {
    updateIssue(issueId, { 
      status: newStatus,
      resolution: newStatus === 'fixed' ? resolution : undefined
    });
    
    toast({
      title: "Success",
      description: `Issue ${newStatus === 'fixed' ? 'marked as fixed' : 'reopened'}`
    });
    
    loadData();
    setViewingIssue(null);
    setResolution("");
  };

  const getStatusBadge = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'fixed':
        return <Badge variant="default" className="bg-success text-success-foreground">Fixed</Badge>;
      case 'reopened':
        return <Badge variant="destructive">Reopened</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
      case 'reopened':
        return 'border-destructive';
      case 'fixed':
        return 'border-success';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Issue Log</h1>
            <p className="text-muted-foreground">
              Track and manage issues found during testing
            </p>
          </div>

          {issues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No issues logged</h3>
                <p className="text-muted-foreground">
                  Issues will appear here when you raise them during script execution
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue.id} className={`shadow-card ${getStatusColor(issue.status)}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            Issue #{issue.issueNumber}: {issue.title}
                          </CardTitle>
                          {getStatusBadge(issue.status)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {issue.description}
                        </CardDescription>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Related Scripts:</span> {getScriptNames(issue.scriptIds)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Created:</span> {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingIssue(issue);
                          setResolution(issue.resolution || "");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* View Issue Dialog */}
          <Dialog open={!!viewingIssue} onOpenChange={() => setViewingIssue(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dropdown-content">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Issue #{viewingIssue?.issueNumber}: {viewingIssue?.title}
                  {viewingIssue && getStatusBadge(viewingIssue.status)}
                </DialogTitle>
                <DialogDescription>
                  Full issue details and resolution options
                </DialogDescription>
              </DialogHeader>
              
              {viewingIssue && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {viewingIssue.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Related Scripts</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingIssue.scriptIds.map(scriptId => {
                        const script = scripts.find(s => s.id === scriptId);
                        return (
                          <Badge key={scriptId} variant="outline">
                            {script ? script.script.scriptId : 'Unknown Script'}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {viewingIssue.screenshots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Screenshots</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viewingIssue.screenshots.map((screenshot) => (
                          <ImageViewer
                            key={screenshot.id}
                            src={screenshot.path}
                            alt={screenshot.filename}
                            description={screenshot.description}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span> {new Date(viewingIssue.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(viewingIssue.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {viewingIssue.resolution && (
                    <div>
                      <h4 className="font-medium mb-2">Resolution</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {viewingIssue.resolution}
                      </p>
                    </div>
                  )}

                  {/* Resolution Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Resolution</h4>
                    
                    {viewingIssue.status !== 'fixed' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resolution">Resolution Details</Label>
                          <Textarea
                            id="resolution"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Enter resolution details..."
                            rows={4}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusChange(viewingIssue.id, 'fixed')}
                            className="bg-success text-success-foreground hover:bg-success/90"
                            disabled={!resolution.trim()}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Fixed
                          </Button>
                        </div>
                      </div>
                    )}

                    {viewingIssue.status === 'fixed' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStatusChange(viewingIssue.id, 'reopened')}
                          variant="destructive"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reopen Issue
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </Layout>
  );
}