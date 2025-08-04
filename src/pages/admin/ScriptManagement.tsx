import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X, FileText } from "lucide-react";
import { getFolders, addScript, getScripts, updateScript, Folder, Script, Screenshot } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ImageViewer } from "@/components/ImageViewer";

export default function ScriptManagement() {
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    subfolderId: "",
    scriptId: "",
    shortDescription: "",
    testEnvironment: "Online" as "Online" | "Batch" | "Online & Batch",
    testType: "Positive" as "Positive" | "Negative",
    purpose: "",
    assumptions: [""],
    expectedResults: "",
    scriptDetails: ""
  });
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
    loadScripts();
    
    if (scriptId) {
      const script = getScripts().find(s => s.id === scriptId);
      if (script) {
        setFormData({
          subfolderId: script.subfolderId,
          scriptId: script.scriptId,
          shortDescription: script.shortDescription,
          testEnvironment: script.testEnvironment,
          testType: script.testType,
          purpose: script.purpose,
          assumptions: script.assumptions,
          expectedResults: script.expectedResults,
          scriptDetails: script.scriptDetails
        });
        setScreenshots(script.screenshots);
        setIsEditing(true);
      }
    }
  }, [scriptId]);

  const loadFolders = () => {
    setFolders(getFolders());
  };

  const loadScripts = () => {
    setScripts(getScripts());
  };

  const subfolders = folders.filter(f => f.isSubfolder);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssumptionChange = (index: number, value: string) => {
    const newAssumptions = [...formData.assumptions];
    newAssumptions[index] = value;
    setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
  };

  const addAssumption = () => {
    setFormData(prev => ({ ...prev, assumptions: [...prev.assumptions, ""] }));
  };

  const removeAssumption = (index: number) => {
    if (formData.assumptions.length > 1) {
      const newAssumptions = formData.assumptions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
    }
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
            id: `screenshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            description: "",
            path: result
          };
          setScreenshots(prev => [...prev, newScreenshot]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const updateScreenshotDescription = (id: string, description: string) => {
    setScreenshots(prev => prev.map(s => s.id === id ? { ...s, description } : s));
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subfolderId || !formData.scriptId || !formData.shortDescription) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const filteredAssumptions = formData.assumptions.filter(a => a.trim());

    try {
      if (isEditing && scriptId) {
        updateScript(scriptId, {
          ...formData,
          assumptions: filteredAssumptions,
          screenshots
        });
        toast({
          title: "Success",
          description: "Script updated successfully"
        });
      } else {
        addScript({
          ...formData,
          assumptions: filteredAssumptions,
          screenshots
        });
        toast({
          title: "Success",
          description: "Script created successfully"
        });
      }
      
      navigate("/admin/listing");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save script"
      });
    }
  };

  return (
    <Layout>
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Script" : "Add New Script"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update script information and details" : "Create a new test script with detailed information"}
            </p>
          </div>

          {subfolders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No sub-folders available</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create sub-folders before adding scripts
                </p>
                <Button onClick={() => navigate("/admin/folders")} className="gradient-primary">
                  Go to Folder Management
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Script Information</CardTitle>
                <CardDescription>
                  Enter all the required details for the test script
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subfolder">Sub-folder *</Label>
                      <Select value={formData.subfolderId} onValueChange={(value) => handleInputChange("subfolderId", value)}>
                        <SelectTrigger className="dropdown-content">
                          <SelectValue placeholder="Select sub-folder" />
                        </SelectTrigger>
                        <SelectContent className="dropdown-content">
                          {subfolders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scriptId">Script ID *</Label>
                      <Input
                        id="scriptId"
                        value={formData.scriptId}
                        onChange={(e) => handleInputChange("scriptId", e.target.value)}
                        placeholder="Enter script ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                      placeholder="Enter short description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="testEnvironment">Test Environment</Label>
                      <Select value={formData.testEnvironment} onValueChange={(value: any) => handleInputChange("testEnvironment", value)}>
                        <SelectTrigger className="dropdown-content">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dropdown-content">
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Batch">Batch</SelectItem>
                          <SelectItem value="Online & Batch">Online & Batch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="testType">Test Type</Label>
                      <Select value={formData.testType} onValueChange={(value: any) => handleInputChange("testType", value)}>
                        <SelectTrigger className="dropdown-content">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dropdown-content">
                          <SelectItem value="Positive">Positive</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange("purpose", e.target.value)}
                      placeholder="Enter the purpose of this test script"
                      rows={3}
                    />
                  </div>

                  {/* Assumptions */}
                  <div className="space-y-2">
                    <Label>Assumptions</Label>
                    {formData.assumptions.map((assumption, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={assumption}
                          onChange={(e) => handleAssumptionChange(index, e.target.value)}
                          placeholder={`Assumption ${index + 1}`}
                        />
                        {formData.assumptions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAssumption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addAssumption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Assumption
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedResults">Expected Results</Label>
                    <Textarea
                      id="expectedResults"
                      value={formData.expectedResults}
                      onChange={(e) => handleInputChange("expectedResults", e.target.value)}
                      placeholder="Enter the expected results"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scriptDetails">Script Details</Label>
                    <Textarea
                      id="scriptDetails"
                      value={formData.scriptDetails}
                      onChange={(e) => handleInputChange("scriptDetails", e.target.value)}
                      placeholder="Enter detailed script information"
                      rows={6}
                    />
                  </div>

                  {/* Screenshots */}
                  <div className="space-y-4">
                    <Label>Screenshots</Label>
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label htmlFor="screenshot-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload screenshots or drag and drop
                        </p>
                      </label>
                    </div>

                    {screenshots.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {screenshots.map((screenshot) => (
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

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="gradient-primary">
                      {isEditing ? "Update Script" : "Create Script"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/admin/listing")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </Layout>
  );
}