"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wand2,
  CheckCircle,
  Clock,
  MapPin,
  GraduationCap,
  User,
  Calendar,
  Play,
  Save,
  AlertCircle,
} from "lucide-react";

const DAY_COLORS = {
  الأحد: "bg-blue-50 text-blue-700",
  الاثنين: "bg-green-50 text-green-700",
  الثلاثاء: "bg-purple-50 text-purple-700",
  الأربعاء: "bg-orange-50 text-orange-700",
  الخميس: "bg-pink-50 text-pink-700",
};

export default function AutoSchedulePage() {
  const qc = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل في توليد الجدول");
      return data;
    },
    onSuccess: (data) => {
      setPreview(data.schedule);
      setApplied(false);
      setError("");
    },
    onError: (e) => {
      setError(e.message);
      setPreview(null);
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل في تطبيق الجدول");
      return data;
    },
    onSuccess: (data) => {
      setApplied(true);
      setPreview(data.schedule);
      qc.invalidateQueries(["schedules"]);
      setError("");
    },
    onError: (e) => setError(e.message),
  });

  const grouped = preview
    ? preview.reduce((acc, s) => {
        if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
        acc[s.day_of_week].push(s);
        return acc;
      }, {})
    : {};

  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
          الجدولة التلقائية
        </h1>
        <p className="text-gray-500 mt-1 font-tajawal">
          توليد جدول خالٍ من التعارضات بخوارزمية Greedy
        </p>
      </div>

      {/* Algorithm Card */}
      <div className="bg-gradient-to-br from-[#6B4CE6] to-[#5A3DD4] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Wand2 size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-tajawal">
              خوارزمية Greedy للجدولة
            </h2>
            <p className="text-white/80 text-sm font-tajawal mt-1">
              تُجدول كل مادة في أول خانة زمنية متاحة (يوم + وقت + قاعة) دون تعارض
              مع دكاترة أو قاعات أخرى.
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              {[
                "5 أيام دراسية",
                "4 خانات زمنية/يوم",
                "بدون تعارضات",
                "O(n × days × slots)",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-white/20 px-3 py-1 rounded-full text-xs font-tajawal"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-white text-[#6B4CE6] px-6 py-3 rounded-xl font-bold font-tajawal hover:bg-gray-50 transition-all disabled:opacity-70"
          >
            <Play size={18} />
            {generateMutation.isPending ? "جاري التوليد..." : "توليد الجدول"}
          </button>
          {preview && !applied && (
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-bold font-tajawal hover:bg-white/30 transition-all border border-white/40 disabled:opacity-70"
            >
              <Save size={18} />
              {applyMutation.isPending ? "جاري التطبيق..." : "تطبيق وحفظ"}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 font-tajawal text-sm">{error}</p>
        </div>
      )}

      {/* Success Applied */}
      {applied && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={24} className="text-green-500" />
          <div>
            <p className="font-bold text-green-900 font-tajawal">
              تم تطبيق الجدول بنجاح!
            </p>
            <p className="text-green-700 text-sm font-tajawal">
              تم حفظ {preview?.length} جلسات في قاعدة البيانات.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 font-tajawal">
              معاينة الجدول ({preview.length} جلسة)
            </h2>
            {!applied && (
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-tajawal font-bold">
                معاينة — لم يُطبَّق بعد
              </span>
            )}
            {applied && (
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-tajawal font-bold">
                ✓ مُطبَّق
              </span>
            )}
          </div>

          {days
            .filter((d) => grouped[d])
            .map((day) => (
              <div
                key={day}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div
                  className={`px-6 py-3 flex items-center gap-3 ${DAY_COLORS[day] || "bg-gray-50 text-gray-700"}`}
                >
                  <Calendar size={18} />
                  <span className="font-bold font-tajawal text-lg">{day}</span>
                  <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-tajawal">
                    {grouped[day].length} جلسة
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {grouped[day].map((s, i) => (
                    <div
                      key={i}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
                    >
                      <div className="flex items-center gap-2 text-gray-500 min-w-[130px]">
                        <Clock size={16} className="text-[#6B4CE6]" />
                        <span className="text-sm font-medium">
                          {s.start_time} - {s.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <GraduationCap
                          size={16}
                          className="text-[#6B4CE6] shrink-0"
                        />
                        <span className="font-bold font-tajawal text-gray-900">
                          {s.course_name}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-tajawal">
                          {s.course_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={16} />
                        <span className="text-sm font-tajawal">
                          {s.doctor_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={16} />
                        <span className="text-sm font-tajawal">
                          {s.room_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({s.room_capacity} مقعد)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty state before generation */}
      {!preview && !generateMutation.isPending && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Wand2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-tajawal text-lg">
            اضغط "توليد الجدول" للبدء
          </p>
          <p className="text-gray-400 font-tajawal text-sm mt-1">
            سيتم توليد جدول مقترح بدون تعارضات بناءً على المواد والقاعات الموجودة
          </p>
        </div>
      )}
    </div>
  );
}
