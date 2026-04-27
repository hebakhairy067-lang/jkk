"use client";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, BookOpen, Mail } from "lucide-react";

export default function DoctorsPage() {
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error("فشل في جلب الدكاترة");
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("فشل");
      return res.json();
    },
  });

  const getCoursesByDoctor = (doctorId) =>
    courses.filter((c) => c.doctor_id === doctorId);

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
          أعضاء التدريس
        </h1>
        <p className="text-gray-500 mt-1 font-tajawal">
          عرض الدكاترة ومواد كل دكتور
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-[#6B4CE6]">{doctors.length}</p>
          <p className="text-sm text-gray-500 font-tajawal">
            إجمالي أعضاء التدريس
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
          <p className="text-sm text-gray-500 font-tajawal">إجمالي المواد</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">
            {doctors.length > 0
              ? (courses.length / doctors.length).toFixed(1)
              : 0}
          </p>
          <p className="text-sm text-gray-500 font-tajawal">
            متوسط المواد لكل دكتور
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-orange-600">
            {new Set(doctors.map((d) => d.department)).size}
          </p>
          <p className="text-sm text-gray-500 font-tajawal">الأقسام</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-[#6B4CE6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const doctorCourses = getCoursesByDoctor(doctor.id);
            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#6B4CE6] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                    {doctor.name.replace("د. ", "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-tajawal">
                      {doctor.name}
                    </h3>
                    <p className="text-gray-500 text-sm font-tajawal">
                      {doctor.department || "علوم الحاسب"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <Mail size={14} />
                  <span className="text-xs">{doctor.email}</span>
                </div>

                <div className="border-t border-gray-50 pt-4">
                  <p className="text-xs text-gray-400 font-tajawal mb-2 flex items-center gap-1">
                    <BookOpen size={12} />
                    المواد ({doctorCourses.length})
                  </p>
                  {doctorCourses.length === 0 ? (
                    <p className="text-xs text-gray-400 font-tajawal">
                      لا توجد مواد مسندة
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {doctorCourses.map((c) => (
                        <span
                          key={c.id}
                          className="bg-purple-50 text-[#6B4CE6] px-2 py-1 rounded-lg text-xs font-tajawal font-medium"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
