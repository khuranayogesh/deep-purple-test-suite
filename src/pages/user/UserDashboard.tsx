import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { UserSidebar } from "@/components/UserSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, TestTube, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import { getProjects, Project } from "@/lib/storage";

export default function UserDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const userProjects = getProjects(user.username);
      setProjects(userProjects);
    }
  }, []);

  const features = [
    {
      title: "Create Project",
      description: "Start a new regression testing project",
      icon: Plus,
      href: "/user/create-project",
      color: "from-primary to-primary-light"
    }
  ];

  return (
    <Layout>
      <UserSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              User Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your regression testing projects and execute test scripts
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => (
                  <Card key={project.id} className="shadow-card hover:shadow-primary transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription>
                            Created {new Date(project.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link 
                          to={`/user/project/${project.id}/test-lab`}
                          className="flex-1"
                        >
                          <Card className="p-3 hover:bg-accent transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                              <TestTube className="h-4 w-4" />
                              <span>Test Lab</span>
                            </div>
                          </Card>
                        </Link>
                        <Link 
                          to={`/user/project/${project.id}/issues`}
                          className="flex-1"
                        >
                          <Card className="p-3 hover:bg-accent transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                              <Bug className="h-4 w-4" />
                              <span>Issues</span>
                            </div>
                          </Card>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}