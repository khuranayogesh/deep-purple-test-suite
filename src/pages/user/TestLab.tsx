import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Target, Eye, AlertTriangle, CheckCircle, Clock, TestTube } from "lucide-react";
import { getImportedScripts, getIssues, ImportedScript, Issue } from "@/lib/storage";
import { useParams, useNavigate } from "react-router-dom";

export default function TestLab() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<ImportedScript[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = () => {
    if (!projectId) return;
    
    setScripts(getImportedScripts(projectId));
    setIssues(getIssues(projectId));
  };

  const getScriptIssues = (scriptId: string) => {
    return issues.filter(issue => 
      issue.scriptIds.includes(scriptId) && issue.status !== 'fixed'
    );
  };

  const allScripts = scripts;
  const completedScripts = scripts.filter(s => s.status === 'completed');
  const pendingScripts = scripts.filter(s => s.status === 'pending' || s.status === 'in-progress');
  const scriptsWithIssues = scripts.filter(s => 
    s.status !== 'completed' && getScriptIssues(s.id).length > 0
  );

  const getActionButton = (script: ImportedScript) => {
    const scriptIssues = getScriptIssues(script.id);
    
    if (script.status === 'completed') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/user/project/${projectId}/script/${script.id}`)}
        >
          <Target className="h-4 w-4 mr-2" />
          Retarget
        </Button>
      );
    }
    
    if (script.status === 'in-progress') {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(`/user/project/${projectId}/script/${script.id}`)}
          className="gradient-primary"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resume
        </Button>
      );
    }
    
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => navigate(`/user/project/${projectId}/script/${script.id}`)}
        className="gradient-primary"
      >
        <Play className="h-4 w-4 mr-2" />
        Start
      </Button>
    );
  };

  const getStatusBadge = (script: ImportedScript) => {
    const scriptIssues = getScriptIssues(script.id);
    
    if (script.status === 'completed') {
      return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
    }
    
    if (scriptIssues.length > 0) {
      return <Badge variant="destructive">Has Issues</Badge>;
    }
    
    if (script.status === 'in-progress') {
      return <Badge variant="default" className="bg-warning text-warning-foreground">In Progress</Badge>;
    }
    
    return <Badge variant="outline">Pending</Badge>;
  };

  const ScriptCard = ({ script }: { script: ImportedScript }) => {
    const scriptIssues = getScriptIssues(script.id);
    
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{script.script.scriptId}</CardTitle>
                <Badge variant="outline">{script.script.testType}</Badge>
                <Badge variant="secondary">{script.script.testEnvironment}</Badge>
                {getStatusBadge(script)}
              </div>
              <CardDescription>{script.script.shortDescription}</CardDescription>
              {scriptIssues.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{scriptIssues.length} issue(s) linked</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-destructive"
                    onClick={() => navigate(`/user/project/${projectId}/issues`)}
                  >
                    View Issues
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/user/project/${projectId}/script/${script.id}?view=true`)}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              {getActionButton(script)}
            </div>
          </div>
        </CardHeader>
        
        {script.remarks && (
          <CardContent>
            <div className="text-sm">
              <span className="font-medium">Last Remarks:</span> {script.remarks}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const EmptyState = ({ icon: Icon, title, description }: { 
    icon: any; 
    title: string; 
    description: string; 
  }) => (
    <Card>
      <CardContent className="text-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Test Lab</h1>
            <p className="text-muted-foreground">
              Execute and manage imported test scripts
            </p>
          </div>

          {allScripts.length === 0 ? (
            <EmptyState
              icon={TestTube}
              title="No scripts imported"
              description="Import test scripts from the script library to start testing"
            />
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  All Scripts ({allScripts.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedScripts.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingScripts.length})
                </TabsTrigger>
                <TabsTrigger value="issues" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  With Issues ({scriptsWithIssues.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {allScripts.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-6">
                {completedScripts.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No completed scripts"
                    description="Scripts will appear here once you mark them as complete"
                  />
                ) : (
                  completedScripts.map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingScripts.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No pending scripts"
                    description="All scripts have been completed"
                  />
                ) : (
                  pendingScripts.map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="issues" className="space-y-4 mt-6">
                {scriptsWithIssues.length === 0 ? (
                  <EmptyState
                    icon={AlertTriangle}
                    title="No scripts with issues"
                    description="Scripts with linked issues will appear here"
                  />
                ) : (
                  scriptsWithIssues.map((script) => (
                    <ScriptCard key={script.id} script={script} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </Layout>
  );
}