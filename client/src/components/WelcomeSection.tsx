import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

export function WelcomeSection() {
  return (
    <section className="mb-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary dark:text-primary-foreground">
            مرحباً بك في منصة دفعة 2026
          </h2>
          <p className="mb-4">
            هذه المنصة توفر المواد التعليمية وجداول الاختبارات للصف الثاني عشر.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full ml-4">
                <FileText className="text-blue-500 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold">الملفات التعليمية</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  تصفح الملفات حسب المادة والفصل الدراسي
                </p>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full ml-4">
                <Calendar className="text-green-500 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-semibold">جدول الاختبارات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  اطلع على مواعيد الاختبارات والدروس المقررة
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
