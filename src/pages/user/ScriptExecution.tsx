import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, X, CheckCircle, AlertTriangle, ArrowLeft, Plus } from "lucide-react";
import { 
  getImportedScripts, 
  updateImportedScript, 
  getIssues, 
  addIssue,
  updateIssue,
  ImportedScript, 
  Issue, 
  Screenshot 
} from "@/lib/storage";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ImageViewer } from "@/components/ImageViewer";

export default function ScriptExecution() {
  const { projectId, scriptId } = useParams<{ projectId: string; scriptId: string }>();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('view') === 'true';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [script, setScript] = useState<ImportedScript | null>(null);
  const [remarks, setRemarks] = useState("");
  const [testScreenshots, setTestScreenshots] = useState<Screenshot[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");

  useEffect(() => {
    if (projectId && scriptId) {
      loadData();
    }
  }, [projectId, scriptId]);

  const loadData = () => {
    if (!projectId || !scriptId) return;
    
    const importedScripts = getImportedScripts(projectId);
    const currentScript = importedScripts.find(s => s.id === scriptId);
    
    if (currentScript) {
      setScript(currentScript);
      setRemarks(currentScript.remarks || "");
      setTestScreenshots(currentScript.testScreenshots || []);
    }
    
    setIssues(getIssues(projectId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const newScreenshot: Screenshot = {
            id: `test_screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            description: "",
            path: result
          };
          setTestScreenshots(prev => [...prev, newScreenshot]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const updateScreenshotDescription = (id: string, description: string) => {
    setTestScreenshots(prev => prev.map(s => s.id === id ? { ...s, description } : s));
  };

  const removeScreenshot = (id: string) => {
    setTestScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleMarkComplete = () => {
    if (!script || !projectId) return;
    
    updateImportedScript(script.id, {
      status: 'completed',
      remarks,
      testScreenshots,
      completedAt: new Date().toISOString()
    });
    
    toast({
      title: "Success",
      description: "Script marked as complete"
    });
    
    navigate(`/user/project/${projectId}/test-lab`);
  };

  const handleRaiseIssue = () => {
    if (!script || !projectId) return;

    if (selectedIssue === "new") {
      if (!newIssueTitle.trim() || !newIssueDescription.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all issue fields"
        });
        return;
      }

      const newIssue = addIssue({
        title: newIssueTitle.trim(),
        description: newIssueDescription.trim(),
        status: 'open',
        projectId,
        scriptIds: [script.id],
        screenshots: []
      });

      updateImportedScript(script.id, {
        issues: [...(script.issues || []), newIssue.id]
      });

      toast({
        title: "Success",
        description: `Issue #${newIssue.issueNumber} created and linked`
      });
    } else if (selectedIssue) {
      const existingIssue = issues.find(i => i.id === selectedIssue);
      if (existingIssue && !existingIssue.scriptIds.includes(script.id)) {
        updateIssue(selectedIssue, {
          scriptIds: [...existingIssue.scriptIds, script.id]
        });

        updateImportedScript(script.id, {
          issues: [...(script.issues || []), selectedIssue]
        });

        toast({
          title: "Success",
          description: "Issue linked to script"
        });
      }
    }

    setIsIssueDialogOpen(false);
    setSelectedIssue("");
    setNewIssueTitle("");
    setNewIssueDescription("");
    loadData();
  };

  const handleSave = () => {
    if (!script) return;
    
    updateImportedScript(script.id, {
      status: script.status === 'pending' ? 'in-progress' : script.status,
      remarks,
      testScreenshots
    });
    
    toast({
      title: "Success",
      description: "Progress saved"
    });
  };

  const getLinkedIssues = () => {
    if (!script?.issues) return [];
    return issues.filter(issue => script.issues!.includes(issue.id));
  };

  if (!script) {
    return (
      <Layout>
        <UserSidebar />
        <main className="flex-1 p-6">
          <div className="text-center">
            <p>Script not found</p>
          </div>
        </main>
      </Layout>
    );
  }

  const linkedIssues = getLinkedIssues();

  return (
    <Layout>
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/user/project/${projectId}/test-lab`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Lab
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isViewMode ? "View Script" : "Execute Script"}
              </h1>
              <p className="text-muted-foreground">
                {script.script.scriptId} - {script.script.shortDescription}
              </p>
            </div>
          </div>

          {/* Issues Banner */}
          {linkedIssues.length > 0 && (
            <Card className="mb-6 border-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">
                      {linkedIssues.length} Issue(s) Linked
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/user/project/${projectId}/issues`)}
                  >
                    View Issues
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {linkedIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-2">
                      <Badge variant="destructive">Issue #{issue.issueNumber}</Badge>
                      <span className="text-sm">{issue.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Script Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Script Details</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{script.script.testType}</Badge>
                <Badge variant="secondary">{script.script.testEnvironment}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {script.script.purpose && (
                <div>
                  <h4 className="font-medium mb-2">Purpose</h4>
                  <p className="text-sm text-muted-foreground">{script.script.purpose}</p>
                </div>
              )}

              {script.script.assumptions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Assumptions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {script.script.assumptions.map((assumption, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {script.script.expectedResults && (
                <div>
                  <h4 className="font-medium mb-2">Expected Results</h4>
                  <p className="text-sm text-muted-foreground">{script.script.expectedResults}</p>
                </div>
              )}

              {script.script.scriptDetails && (
                <div>
                  <h4 className="font-medium mb-2">Script Details</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {script.script.scriptDetails}
                  </div>
                </div>
              )}

              {script.script.screenshots.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Reference Screenshots</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {script.script.screenshots.map((screenshot) => (
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
            </CardContent>
          </Card>

          {/* Execution Section */}
          {!isViewMode && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Execution</CardTitle>
                <CardDescription>
                  Add remarks and screenshots for your test execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter your testing remarks and observations"
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Add Screenshots</Label>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="test-screenshot-upload"
                    />
                    <label htmlFor="test-screenshot-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload test screenshots
                      </p>
                    </label>
                  </div>

                  {testScreenshots.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testScreenshots.map((screenshot) => (
                        <div key={screenshot.id} className="space-y-2">
                          <ImageViewer 
                            src={screenshot.path} 
                            alt={screenshot.filename}
                            description={screenshot.description}
                          />
                          <Input
                            value={screenshot.description}
                            onChange={(e) => updateScreenshotDescription(screenshot.id, e.target.value)}
                            placeholder="Enter description"
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeScreenshot(screenshot.id)}
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={handleMarkComplete}
                    className="gradient-primary"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>

                  <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Raise Issue
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dropdown-content">
                      <DialogHeader>
                        <DialogTitle>Raise or Link Issue</DialogTitle>
                        <DialogDescription>
                          Create a new issue or link an existing one to this script
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Issue</Label>
                          <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                            <SelectTrigger className="dropdown-content">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="dropdown-content">
                              <SelectItem value="new">Create New Issue</SelectItem>
                              {issues.filter(i => !i.scriptIds.includes(script.id)).map((issue) => (
                                <SelectItem key={issue.id} value={issue.id}>
                                  Issue #{issue.issueNumber}: {issue.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedIssue === "new" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="issueTitle">Issue Title</Label>
                              <Input
                                id="issueTitle"
                                value={newIssueTitle}
                                onChange={(e) => setNewIssueTitle(e.target.value)}
                                placeholder="Enter issue title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="issueDescription">Issue Description</Label>
                              <Textarea
                                id="issueDescription"
                                value={newIssueDescription}
                                onChange={(e) => setNewIssueDescription(e.target.value)}
                                placeholder="Describe the issue in detail"
                                rows={3}
                              />
                            </div>
                          </>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={handleRaiseIssue} disabled={!selectedIssue}>
                            {selectedIssue === "new" ? "Create Issue" : "Link Issue"}
                          </Button>
                          <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Mode for completed scripts */}
          {isViewMode && testScreenshots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Screenshots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testScreenshots.map((screenshot) => (
                    <ImageViewer
                      key={screenshot.id}
                      src={screenshot.path}
                      alt={screenshot.filename}
                      description={screenshot.description}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </Layout>
  );
}