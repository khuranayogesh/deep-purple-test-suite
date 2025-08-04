import { useState, useEffect } from "react";
import { Plus, LogOut, ChevronDown, ChevronRight, FolderOpen, Import, TestTube, Bug } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout, getCurrentUser } from "@/lib/auth";
import { getProjects, Project } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function UserSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const userProjects = getProjects(user.username);
      setProjects(userProjects);
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate("/");
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-smooth ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"}`;

  return (
    <Sidebar className={`bg-sidebar border-r border-sidebar-border ${collapsed ? "w-14" : "w-60"}`}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-sidebar-foreground" />
          {!collapsed && (
            <h2 className="font-semibold text-sidebar-foreground">User Panel</h2>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Projects"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/user/create-project" className={getNavCls}>
                    <Plus className="h-4 w-4" />
                    {!collapsed && <span>Create Project</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {projects.length > 0 && !collapsed && (
                <SidebarMenuItem>
                  <div className="px-2 py-1">
                    <p className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                      My Projects
                    </p>
                  </div>
                </SidebarMenuItem>
              )}

              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <Collapsible 
                    open={expandedProjects.has(project.id)}
                    onOpenChange={() => toggleProject(project.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          {!collapsed && <span className="truncate">{project.name}</span>}
                        </div>
                        {!collapsed && (
                          expandedProjects.has(project.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    
                    {!collapsed && (
                      <CollapsibleContent className="ml-4 border-l border-sidebar-border/50">
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <NavLink 
                                to={`/user/project/${project.id}/import`} 
                                className={getNavCls}
                              >
                                <Import className="h-4 w-4" />
                                <span>Import Scripts</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <NavLink 
                                to={`/user/project/${project.id}/test-lab`} 
                                className={getNavCls}
                              >
                                <TestTube className="h-4 w-4" />
                                <span>Test Lab</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <NavLink 
                                to={`/user/project/${project.id}/issues`} 
                                className={getNavCls}
                              >
                                <Bug className="h-4 w-4" />
                                <span>Issue Log</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}