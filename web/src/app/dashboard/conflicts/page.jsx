"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
  Clock,
  Building2,
  GraduationCap,
  User,
} from "lucide-react";

const conflictTypeConfig = {
  تعارض_قاعة: {
    label: "تعارض قاعة",
    color: "bg-red-50 border-red-200 text-red-700",
    icon: Building2,
    badge: "bg-red-100 text-red-600",
  },
  تعارض_دكتور: {
    label: "تعارض دكتور",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    icon: User,
    badge: "bg-orange-100 text-orange-600",
  },
  تعارض_مادة: {
    label: "تعارض مادة",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    icon: GraduationCap,
    badge: "bg-yellow-100 text-yellow-600",
  },
};

export default function ConflictsPage() {
  const [filter, setFilter] = useState("الكل");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const res = await fetch("/api/conflicts");
      if (!res.ok) throw new Error("فشل في فحص التعارضات");
      return res.json();
    },
  });

  const conflicts = data?.conflicts || [];
  const types = ["الكل", "تعارض_قاعة", "تعارض_دكتور", "تعارض_مادة"];
  const filtered =
    filter === "الكل" ? conflicts : conflicts.filter((c) => c.type === filter);

  const hallCount = conflicts.filter((c) => c.type === "تعارض_قاعة").length;
  const doctorCount = conflicts.filter((c) => c.type === "تعارض_دكتور").length;
  const courseCount = conflicts.filter((c) => c.type === "تعارض_مادة").length;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            كشف التعارضات
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            فحص تلقائي لتعارضات القاعات والدكاترة والمواد
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-[#6B4CE6] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#6B4CE6]/30 font-tajawal font-bold hover:bg-[#5A3DD4] transition-all flex items-center gap-2 disabled:opacity-70"
        >
          <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "جاري الفحص..." : "إعادة الفحص"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border-2 ${conflicts.length === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <div className="flex items-center gap-3">
            {conflicts.length === 0 ? (
              <CheckCircle size={28} className="text-green-500" />
            ) : (
              <AlertTriangle size={28} className="text-red-500" />
            )}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {conflicts.length}
              </p>
              <p className="text-xs font-tajawal text-gray-500 mt-0.5">
                إجمالي التعارضات
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100">
          <p className="text-2xl font-bold text-red-600">{hallCount}</p>
          <p className="text-xs font-tajawal text-gray-500 mt-0.5">
            تعارضات قاعات
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100">
          <p className="text-2xl font-bold text-orange-600">{doctorCount}</p>
          <p className="text-xs font-tajawal text-gray-500 mt-0.5">
            تعارضات دكاترة
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{courseCount}</p>
          <p className="text-xs font-tajawal text-gray-500 mt-0.5">
            تعارضات مواد
          </p>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={20} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-blue-900 font-tajawal text-sm">
            خوارزمية كشف التعارضات
          </p>
          <p className="text-blue-700 text-xs font-tajawal mt-1">
            يستخدم النظام خوارزمية O(n²) للمقارنة بين كل زوج من الجلسات — يكشف
            تعارضات القاعات والدكاترة والمواد تلقائياً.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl font-tajawal text-sm font-medium transition-all ${
              filter === t
                ? "bg-[#6B4CE6] text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "الكل" ? "الكل" : conflictTypeConfig[t]?.label || t}
            <span className="mr-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {t === "الكل"
                ? conflicts.length
                : conflicts.filter((c) => c.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Conflicts List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-[#6B4CE6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <CheckCircle size={56} className="mx-auto text-green-400 mb-4" />
          <p className="text-2xl font-bold text-gray-900 font-tajawal mb-2">
            {filter === "الكل"
              ? "لا توجد تعارضات! 🎉"
              : `لا توجد ${conflictTypeConfig[filter]?.label || "تعارضات"}`}
          </p>
          <p className="text-gray-500 font-tajawal">
            الجدول نظيف وخالٍ من التعارضات
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((conflict, idx) => {
            const config = conflictTypeConfig[conflict.type] || {
              label: conflict.type,
              color: "bg-gray-50 border-gray-200 text-gray-700",
              icon: AlertTriangle,
              badge: "bg-gray-100 text-gray-600",
            };
            const Icon = config.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl border-2 p-5 ${config.color}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl ${config.badge} shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold font-tajawal ${config.badge}`}
                        >
                          {config.label}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock size={12} />
                          <span className="font-tajawal">{conflict.day}</span>
                        </div>
                      </div>
                      <p className="font-bold text-sm font-tajawal text-gray-900 mb-1">
                        {conflict.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        <span className="font-tajawal">
                          📌 جلسة {conflict.session1_id}:{" "}
                          {conflict.session1_info}
                        </span>
                        <span className="font-tajawal">
                          📌 جلسة {conflict.session2_id}:{" "}
                          {conflict.session2_info}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
