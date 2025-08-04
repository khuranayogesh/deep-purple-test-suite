import { useState } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderPlus } from "lucide-react";
import { addProject } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a project name"
      });
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not found. Please login again."
      });
      return;
    }

    setIsLoading(true);

    try {
      const newProject = addProject(projectName.trim(), user.username);
      toast({
        title: "Success",
        description: `Project "${newProject.name}" created successfully`
      });
      navigate("/user");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">
              Create a new regression testing project to organize your test scripts
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <FolderPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Enter the details for your new regression testing project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name (e.g., Regression Test 1)"
                    className="transition-smooth"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a descriptive name for your testing project
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens after creating a project?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your project will appear in the sidebar navigation</li>
                    <li>• You can import test scripts from the administrator's library</li>
                    <li>• Access Test Lab to execute and manage test scripts</li>
                    <li>• Track and manage issues found during testing</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="gradient-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/user")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}