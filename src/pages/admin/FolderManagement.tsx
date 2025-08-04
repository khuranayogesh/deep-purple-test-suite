import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Folder, FolderPlus, Edit, Trash2 } from "lucide-react";
import { getFolders, addFolder, updateFolder, deleteFolder, Folder as FolderType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function FolderManagement() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [folderName, setFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string>("");
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = () => {
    const loadedFolders = getFolders();
    setFolders(loadedFolders);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a folder name"
      });
      return;
    }

    try {
      if (editingFolder) {
        updateFolder(editingFolder.id, { name: folderName.trim() });
        toast({
          title: "Success",
          description: "Folder updated successfully"
        });
      } else {
        addFolder({
          name: folderName.trim(),
          parentId: parentFolderId || undefined,
          isSubfolder: !!parentFolderId
        });
        toast({
          title: "Success",
          description: "Folder created successfully"
        });
      }
      
      loadFolders();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save folder"
      });
    }
  };

  const handleEdit = (folder: FolderType) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setParentFolderId(folder.parentId || "");
    setIsDialogOpen(true);
  };

  const handleDelete = (folderId: string) => {
    try {
      deleteFolder(folderId);
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      });
      loadFolders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete folder"
      });
    }
  };

  const resetForm = () => {
    setFolderName("");
    setParentFolderId("");
    setEditingFolder(null);
  };

  const mainFolders = folders.filter(f => !f.isSubfolder);
  const getSubfolders = (parentId: string) => folders.filter(f => f.parentId === parentId);

  return (
    <Layout>
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Folder Management</h1>
              <p className="text-muted-foreground">Create and manage folders and sub-folders</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="dropdown-content">
                <DialogHeader>
                  <DialogTitle>
                    {editingFolder ? "Edit Folder" : "Add New Folder"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFolder ? "Update folder information" : "Create a new folder or sub-folder"}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentFolder">Parent Folder (Optional)</Label>
                    <Select value={parentFolderId} onValueChange={setParentFolderId}>
                      <SelectTrigger className="dropdown-content">
                        <SelectValue placeholder="Select parent folder" />
                      </SelectTrigger>
                      <SelectContent className="dropdown-content">
                        <SelectItem value="">None (Root Folder)</SelectItem>
                        {mainFolders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="gradient-primary">
                      {editingFolder ? "Update" : "Create"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {folders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No folders created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first folder to organize your test scripts
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Folder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mainFolders.map((folder) => (
                <Card key={folder.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{folder.name}</CardTitle>
                          <CardDescription>Main Folder</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(folder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(folder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {getSubfolders(folder.id).length > 0 && (
                    <CardContent>
                      <div className="ml-6 space-y-2">
                        {getSubfolders(folder.id).map((subfolder) => (
                          <div key={subfolder.id} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <FolderPlus className="h-4 w-4 text-primary-light" />
                              <span>{subfolder.name}</span>
                              <span className="text-xs text-muted-foreground">(Sub-folder)</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(subfolder)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(subfolder.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}