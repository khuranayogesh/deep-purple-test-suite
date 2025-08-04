import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2, FileText, Plus } from "lucide-react";
import { getFolders, getScripts, deleteScript, Folder, Script } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ImageViewer } from "@/components/ImageViewer";

export default function ScriptListing() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [viewingScript, setViewingScript] = useState<Script | null>(null);
  const [deleteConfirmScript, setDeleteConfirmScript] = useState<Script | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, searchTerm, selectedFolder]);

  const loadData = () => {
    setFolders(getFolders());
    setScripts(getScripts());
  };

  const filterScripts = () => {
    let filtered = scripts;

    if (selectedFolder !== "all") {
      filtered = filtered.filter(script => script.subfolderId === selectedFolder);
    }

    if (searchTerm) {
      filtered = filtered.filter(script =>
        script.scriptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredScripts(filtered);
  };

  const handleDelete = (script: Script) => {
    setDeleteConfirmScript(script);
  };

  const confirmDelete = () => {
    if (deleteConfirmScript) {
      deleteScript(deleteConfirmScript.id);
      toast({
        title: "Success",
        description: "Script deleted successfully"
      });
      loadData();
      setDeleteConfirmScript(null);
    }
  };

  const getSubfolderName = (subfolderId: string) => {
    const folder = folders.find(f => f.id === subfolderId);
    return folder ? folder.name : "Unknown";
  };

  const getParentFolderName = (subfolderId: string) => {
    const subfolder = folders.find(f => f.id === subfolderId);
    if (subfolder && subfolder.parentId) {
      const parent = folders.find(f => f.id === subfolder.parentId);
      return parent ? parent.name : "Unknown";
    }
    return "Root";
  };

  const subfolders = folders.filter(f => f.isSubfolder);

  return (
    <Layout>
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Script Listing</h1>
              <p className="text-muted-foreground">View, modify, and delete test scripts</p>
            </div>
            
            <Button onClick={() => navigate("/admin/scripts")} className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Script
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Script ID or Description"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Folder</label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="dropdown-content">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dropdown-content">
                      <SelectItem value="all">All Folders</SelectItem>
                      {subfolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {getParentFolderName(folder.id)} → {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scripts List */}
          {filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {scripts.length === 0 ? "No scripts created yet" : "No scripts found"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {scripts.length === 0 
                    ? "Create your first test script to get started"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {scripts.length === 0 && (
                  <Button onClick={() => navigate("/admin/scripts")} className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Script
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map((script) => (
                <Card key={script.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{script.scriptId}</CardTitle>
                          <Badge variant="outline">{script.testType}</Badge>
                          <Badge variant="secondary">{script.testEnvironment}</Badge>
                        </div>
                        <CardDescription>{script.shortDescription}</CardDescription>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Folder:</span> {getParentFolderName(script.subfolderId)} → {getSubfolderName(script.subfolderId)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingScript(script)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/scripts/${script.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          Modify
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(script)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* View Script Dialog */}
          <Dialog open={!!viewingScript} onOpenChange={() => setViewingScript(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dropdown-content">
              <DialogHeader>
                <DialogTitle>
                  {viewingScript?.scriptId} - {viewingScript?.shortDescription}
                </DialogTitle>
                <DialogDescription>
                  Read-only view of script details
                </DialogDescription>
              </DialogHeader>
              
              {viewingScript && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Test Environment</h4>
                      <Badge variant="secondary">{viewingScript.testEnvironment}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Test Type</h4>
                      <Badge variant="outline">{viewingScript.testType}</Badge>
                    </div>
                  </div>

                  {viewingScript.purpose && (
                    <div>
                      <h4 className="font-medium mb-2">Purpose</h4>
                      <p className="text-sm text-muted-foreground">{viewingScript.purpose}</p>
                    </div>
                  )}

                  {viewingScript.assumptions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Assumptions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {viewingScript.assumptions.map((assumption, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {viewingScript.expectedResults && (
                    <div>
                      <h4 className="font-medium mb-2">Expected Results</h4>
                      <p className="text-sm text-muted-foreground">{viewingScript.expectedResults}</p>
                    </div>
                  )}

                  {viewingScript.scriptDetails && (
                    <div>
                      <h4 className="font-medium mb-2">Script Details</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {viewingScript.scriptDetails}
                      </div>
                    </div>
                  )}

                  {viewingScript.screenshots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Screenshots</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viewingScript.screenshots.map((screenshot) => (
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
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirmScript} onOpenChange={() => setDeleteConfirmScript(null)}>
            <DialogContent className="dropdown-content">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the script "{deleteConfirmScript?.scriptId}"? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirmScript(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </Layout>
  );
}