import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateLogin, setCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("User");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both username and password"
      });
      setIsLoading(false);
      return;
    }

    const user = validateLogin(username, password, userType);
    
    if (user) {
      setCurrentUser(user);
      toast({
        title: "Login Successful",
        description: `Welcome, ${user.username}!`
      });
      
      if (user.userType === "Administrator") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please check your username, password, and user type."
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <Card className="w-full max-w-md shadow-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Regression Assistant
          </CardTitle>
          <CardDescription>
            Please enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="transition-smooth"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="transition-smooth"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="dropdown-content">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent className="dropdown-content">
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-primary transition-smooth"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}