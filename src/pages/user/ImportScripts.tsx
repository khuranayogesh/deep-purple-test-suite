import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Check, FileText } from "lucide-react";
import { getFolders, getScripts, importScript, getImportedScripts, Folder, Script } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

export default function ImportScripts() {
  const { projectId } = useParams<{ projectId: string }>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [importedScriptIds, setImportedScriptIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  useEffect(() => {
    filterScripts();
  }, [scripts, searchTerm, selectedFolder]);

  const loadData = () => {
    if (!projectId) return;
    
    setFolders(getFolders());
    setScripts(getScripts());
    
    const imported = getImportedScripts(projectId);
    const importedIds = new Set(imported.map(s => s.originalScriptId));
    setImportedScriptIds(importedIds);
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

  const handleImport = (scriptId: string) => {
    if (!projectId) return;
    
    try {
      importScript(scriptId, projectId);
      setImportedScriptIds(prev => new Set([...prev, scriptId]));
      toast({
        title: "Success",
        description: "Script imported successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import script"
      });
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
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Import Test Scripts</h1>
            <p className="text-muted-foreground">
              Import test scripts from the administrator's library to your project
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Find Scripts</CardTitle>
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
                  {scripts.length === 0 ? "No scripts available" : "No scripts found"}
                </h3>
                <p className="text-muted-foreground">
                  {scripts.length === 0 
                    ? "Contact the administrator to create test scripts"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredScripts.map((script) => {
                const isImported = importedScriptIds.has(script.id);
                
                return (
                  <Card key={script.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{script.scriptId}</CardTitle>
                            <Badge variant="outline">{script.testType}</Badge>
                            <Badge variant="secondary">{script.testEnvironment}</Badge>
                            {isImported && (
                              <Badge variant="default" className="bg-success text-success-foreground">
                                <Check className="h-3 w-3 mr-1" />
                                Imported
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{script.shortDescription}</CardDescription>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Folder:</span> {getParentFolderName(script.subfolderId)} → {getSubfolderName(script.subfolderId)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isImported ? (
                            <Button variant="secondary" size="sm" disabled>
                              <Check className="h-4 w-4 mr-2" />
                              Already Imported
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleImport(script.id)}
                              className="gradient-primary"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Import
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {script.purpose && (
                      <CardContent>
                        <div className="text-sm">
                          <span className="font-medium">Purpose:</span> {script.purpose}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Total available scripts: {scripts.length}</span>
                <span>Imported to this project: {importedScriptIds.size}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}