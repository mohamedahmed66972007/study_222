import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Menu,
  BookText,
  CalendarDays,
  LogIn,
  LogOut,
  BookCopy,
} from "lucide-react";

export function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="px-1">
                <SheetTitle>مدرستنا - القائمة</SheetTitle>
                <SheetDescription>
                  اختر من قائمة الخيارات أدناه
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4 py-6">
                <SheetClose asChild>
                  <Link href="/">
                    <div
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                        location === "/"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <BookText className="h-5 w-5" />
                      <span>الملفات التعليمية</span>
                    </div>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/schedule">
                    <div
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                        location === "/schedule"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <CalendarDays className="h-5 w-5" />
                      <span>جدول الامتحانات</span>
                    </div>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/quizzes">
                    <div
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                        location === "/quizzes"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <BookCopy className="h-5 w-5" />
                      <span>الاختبارات</span>
                    </div>
                  </Link>
                </SheetClose>
                <div className="flex flex-col gap-2 py-2">
                  <hr className="my-2" />
                  {isAuthenticated ? (
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>تسجيل الخروج</span>
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          className="justify-start w-full"
                        >
                          <LogIn className="mr-2 h-5 w-5" />
                          <span>تسجيل الدخول</span>
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </nav>
              <SheetFooter className="flex-row justify-end gap-2 border-t pt-4">
                <ThemeToggle />
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Link href="/">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold tracking-tight text-primary">
                مدرستنا - دفعة 2026
              </h1>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                location === "/"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookText className="h-5 w-5" />
              <span>الملفات التعليمية</span>
            </div>
          </Link>
          <Link href="/schedule">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                location === "/schedule"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-5 w-5" />
              <span>جدول الامتحانات</span>
            </div>
          </Link>
          <Link href="/quizzes">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                location === "/quizzes"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookCopy className="h-5 w-5" />
              <span>الاختبارات</span>
            </div>
          </Link>
          {isAuthenticated ? (
            <Button variant="ghost" onClick={logout}>
              <LogOut className="mr-2 h-5 w-5" />
              <span>تسجيل الخروج</span>
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost">
                <LogIn className="mr-2 h-5 w-5" />
                <span>تسجيل الدخول</span>
              </Button>
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}