import { Folder, FileText, List, LogOut, Menu } from "lucide-react";
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
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const adminItems = [
  { title: "Add Folder", url: "/admin/folders", icon: Folder },
  { title: "Add Script", url: "/admin/scripts", icon: FileText },
  { title: "Script Listing", url: "/admin/listing", icon: List },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate("/");
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-smooth ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"}`;

  return (
    <Sidebar className={`bg-sidebar border-r border-sidebar-border ${collapsed ? "w-14" : "w-60"}`}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-sidebar-foreground" />
          {!collapsed && (
            <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
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