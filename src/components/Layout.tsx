import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {children}
      </div>
    </SidebarProvider>
  );
}