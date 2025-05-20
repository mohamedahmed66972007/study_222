import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Loader2, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setErrorMessage("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        });
        setLocation("/");
      } else {
        setErrorMessage("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary dark:text-primary-foreground text-center">
              تسجيل دخول المشرف
            </h2>
            
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <LockKeyhole className="h-10 w-10" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-1"
                >
                  اسم المستخدم
                </label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  dir="rtl"
                />
              </div>
              
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  كلمة المرور
                </label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  dir="rtl"
                />
              </div>
              
              {errorMessage && (
                <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>
                  تسجيل الدخول مخصص للمشرفين فقط
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
