"use client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  DoorOpen,
  Users,
  LogOut,
  GraduationCap,
  Bell,
  Search,
  Menu,
  X,
  BookOpen,
  AlertTriangle,
  Wand2,
  Bot,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      window.location.href = "/";
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const navItems = [
    { label: "الرئيسية", icon: LayoutDashboard, href: "/dashboard" },
    { label: "الجداول الدراسية", icon: Calendar, href: "/dashboard/schedules" },
    { label: "المواد الدراسية", icon: BookOpen, href: "/dashboard/courses" },
    { label: "القاعات والمعامل", icon: DoorOpen, href: "/dashboard/rooms" },
    { label: "أعضاء التدريس", icon: Users, href: "/dashboard/doctors" },
    {
      label: "كشف التعارضات",
      icon: AlertTriangle,
      href: "/dashboard/conflicts",
    },
    {
      label: "الجدولة التلقائية",
      icon: Wand2,
      href: "/dashboard/auto-schedule",
    },
    { label: "المساعد الذكي", icon: Bot, href: "/dashboard/ai" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-[#6B4CE6] text-white transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 md:relative ${
          sidebarOpen ? "w-64" : "w-20"
        } ${!sidebarOpen && "md:w-20"} flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap size={32} />
              <span className="text-xl font-bold font-tajawal">My Guide</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                pathname === item.href
                  ? "bg-white text-[#6B4CE6]"
                  : "hover:bg-white/10"
              }`}
            >
              <item.icon size={24} />
              {sidebarOpen && (
                <span className="font-tajawal font-medium">{item.label}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-all"
          >
            <LogOut size={24} />
            {sidebarOpen && (
              <span className="font-tajawal font-medium">تسجيل الخروج</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10">
          <div className="relative max-w-md w-full hidden md:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="البحث بالدكتور أو المادة..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/20 font-tajawal text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 font-tajawal">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 uppercase">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-[#6B4CE6] rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
