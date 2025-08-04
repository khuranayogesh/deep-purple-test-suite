import { Layout } from "@/components/Layout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, FileText, List } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const features = [
    {
      title: "Add Folder",
      description: "Create and manage folders and sub-folders for organizing test scripts",
      icon: Folder,
      href: "/admin/folders",
      color: "from-primary to-primary-light"
    },
    {
      title: "Add Script",
      description: "Create new test scripts with detailed information and screenshots",
      icon: FileText,
      href: "/admin/scripts",
      color: "from-primary-light to-primary"
    },
    {
      title: "Script Listing",
      description: "View, modify, and delete existing test scripts",
      icon: List,
      href: "/admin/listing",
      color: "from-primary to-primary-dark"
    }
  ];

  return (
    <Layout>
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              Administrator Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage folders, scripts, and test data for the regression testing system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.href}>
                <Card className="h-full hover:shadow-primary transition-all duration-300 hover:-translate-y-1 group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-primary font-medium group-hover:text-primary-light transition-colors">
                      Click to access →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}