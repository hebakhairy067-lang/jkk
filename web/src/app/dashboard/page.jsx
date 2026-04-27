"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Users,
  DoorOpen,
  AlertCircle,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Wand2,
  Bot,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules", "all"],
    queryFn: async () => {
      const res = await fetch("/api/schedules?role=manager");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: conflictData } = useQuery({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const res = await fetch("/api/conflicts");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const conflictCount = conflictData?.conflict_count ?? 0;
  const availableRooms = rooms.filter((r) => r.status === "available").length;

  const stats = [
    {
      label: "إجمالي المحاضرات",
      value: schedules.length,
      icon: CalendarIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "القاعات المتاحة",
      value: `${availableRooms}/${rooms.length}`,
      icon: DoorOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "أعضاء التدريس",
      value: doctors.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "المواد الدراسية",
      value: courses.length,
      icon: BookOpen,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const quickLinks = [
    {
      label: "كشف التعارضات",
      href: "/dashboard/conflicts",
      icon: AlertCircle,
      color:
        conflictCount > 0
          ? "text-red-500 bg-red-50 border-red-200"
          : "text-green-500 bg-green-50 border-green-200",
      count: conflictCount,
      countLabel: conflictCount > 0 ? `${conflictCount} تعارض` : "لا تعارضات",
    },
    {
      label: "الجدولة التلقائية",
      href: "/dashboard/auto-schedule",
      icon: Wand2,
      color: "text-purple-500 bg-purple-50 border-purple-200",
      countLabel: "Greedy Algorithm",
    },
    {
      label: "المساعد الذكي",
      href: "/dashboard/ai",
      icon: Bot,
      color: "text-blue-500 bg-blue-50 border-blue-200",
      countLabel: "Claude AI",
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            مرحباً{user ? `، ${user.name}` : ""} 👋
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            نظرة عامة على نظام إدارة الجداول
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/dashboard/auto-schedule"
            className="bg-[#6B4CE6] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#6B4CE6]/30 font-tajawal text-sm hover:bg-[#5A3DD4] transition-all flex items-center gap-2"
          >
            <Wand2 size={16} />
            جدولة تلقائية
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-tajawal">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Conflict alert if any */}
      {conflictCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <p className="font-bold text-red-900 font-tajawal">
                تم اكتشاف {conflictCount} تعارض في الجدول
              </p>
              <p className="text-red-700 text-sm font-tajawal">
                يوجد تعارض في المواعيد — يرجى المراجعة الفورية
              </p>
            </div>
          </div>
          <a
            href="/dashboard/conflicts"
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-tajawal text-sm hover:bg-red-600 transition-all whitespace-nowrap"
          >
            عرض التعارضات
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Schedules */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-tajawal">
              آخر المحاضرات
            </h2>
            <a
              href="/dashboard/schedules"
              className="text-[#6B4CE6] font-medium text-sm hover:underline font-tajawal"
            >
              عرض الكل
            </a>
          </div>
          <div className="space-y-3">
            {schedules.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
                    {s.lecture_number || "1"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 font-tajawal text-sm">
                      {s.course_name}
                    </p>
                    <p className="text-xs text-gray-500 font-tajawal">
                      {s.doctor_name} · {s.room_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#6B4CE6]">
                    {s.start_time} - {s.end_time}
                  </p>
                  <p className="text-xs text-gray-400 font-tajawal">
                    {s.day_of_week} · {s.level}
                  </p>
                </div>
              </div>
            ))}
            {schedules.length === 0 && (
              <div className="text-center py-8 text-gray-400 font-tajawal">
                لا توجد محاضرات — ابدأ بالجدولة التلقائية
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 font-tajawal mb-4">
            الأدوات الذكية
          </h2>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${link.color}`}
              >
                <link.icon size={20} />
                <div>
                  <p className="font-bold text-sm font-tajawal">{link.label}</p>
                  <p className="text-xs font-tajawal opacity-75">
                    {link.countLabel}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-tajawal mb-2">
              الإحصائيات السريعة
            </p>
            {[
              {
                label: "Level 3",
                value: courses.filter((c) => c.level === "Level 3").length,
                color: "bg-orange-400",
              },
              {
                label: "Level 4",
                value: courses.filter((c) => c.level === "Level 4").length,
                color: "bg-purple-400",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 font-tajawal w-16">
                  {item.label}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${courses.length ? (item.value / courses.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
