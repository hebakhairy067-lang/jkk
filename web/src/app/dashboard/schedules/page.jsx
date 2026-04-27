"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Clock,
  MapPin,
  GraduationCap,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  AlertTriangle,
  Wand2,
  Calendar,
} from "lucide-react";

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const EMPTY_FORM = {
  course_id: "",
  room_id: "",
  day_of_week: "الأحد",
  start_time: "08:00",
  end_time: "10:00",
  lecture_number: 1,
};

export default function SchedulesManagement() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [filterDay, setFilterDay] = useState("الكل");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules", "all"],
    queryFn: async () => {
      const res = await fetch("/api/schedules?role=manager");
      if (!res.ok) throw new Error("فشل في جلب الجداول");
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

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("فشل");
      return res.json();
    },
  });

  const { data: conflictData } = useQuery({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const res = await fetch("/api/conflicts");
      if (!res.ok) throw new Error("فشل");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل في الإضافة");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries(["schedules"]);
      qc.invalidateQueries(["conflicts"]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setError("");
    },
    onError: (e) => setError(e.message),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل في التعديل");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries(["schedules"]);
      qc.invalidateQueries(["conflicts"]);
      setShowModal(false);
      setEditSchedule(null);
      setForm(EMPTY_FORM);
      setError("");
    },
    onError: (e) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل في الحذف");
    },
    onSuccess: () => {
      qc.invalidateQueries(["schedules"]);
      qc.invalidateQueries(["conflicts"]);
      setDeleteId(null);
    },
  });

  const openAdd = () => {
    setEditSchedule(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditSchedule(s);
    setForm({
      course_id: String(s.course_id),
      room_id: String(s.room_id),
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      lecture_number: s.lecture_number || 1,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.course_id) {
      setError("يرجى اختيار المادة");
      return;
    }
    if (!form.room_id) {
      setError("يرجى اختيار القاعة");
      return;
    }
    const data = {
      course_id: Number(form.course_id),
      room_id: Number(form.room_id),
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      lecture_number: Number(form.lecture_number),
    };
    if (editSchedule) {
      editMutation.mutate({ id: editSchedule.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const conflictCount = conflictData?.conflict_count ?? 0;
  const filtered =
    filterDay === "الكل"
      ? schedules
      : schedules.filter((s) => s.day_of_week === filterDay);

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            إدارة الجداول
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            جدولة المحاضرات وتوزيع القاعات
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/auto-schedule"
            className="flex items-center gap-2 border border-[#6B4CE6] text-[#6B4CE6] px-4 py-3 rounded-xl font-tajawal font-bold hover:bg-purple-50 transition-all"
          >
            <Wand2 size={18} />
            جدولة تلقائية
          </a>
          <button
            onClick={openAdd}
            className="bg-[#6B4CE6] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#6B4CE6]/30 font-tajawal font-bold hover:bg-[#5A3DD4] transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة محاضرة
          </button>
        </div>
      </div>

      {/* Conflict Alert */}
      {conflictCount > 0 && (
        <a
          href="/dashboard/conflicts"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-all"
        >
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-700 font-tajawal text-sm font-bold">
            ⚠️ يوجد {conflictCount} تعارض في الجدول — اضغط للمراجعة
          </p>
        </a>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["الكل", ...DAYS].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDay(d)}
            className={`px-4 py-2 rounded-xl font-tajawal text-sm font-medium transition-all ${
              filterDay === d
                ? "bg-[#6B4CE6] text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {d}
          </button>
        ))}
        <span className="mr-auto text-sm text-gray-400 font-tajawal self-center">
          {filtered.length} محاضرة
        </span>
      </div>

      {/* Schedules Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-[#6B4CE6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-tajawal text-lg">لا توجد محاضرات</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={openAdd}
              className="text-[#6B4CE6] font-bold font-tajawal hover:underline"
            >
              إضافة محاضرة يدوياً
            </button>
            <span className="text-gray-300">|</span>
            <a
              href="/dashboard/auto-schedule"
              className="text-[#6B4CE6] font-bold font-tajawal hover:underline"
            >
              توليد تلقائي
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 hover:shadow-md transition-all border-r-4 border-r-[#6B4CE6]"
            >
              <div className="flex items-center justify-between">
                <span className="bg-purple-100 text-[#6B4CE6] px-3 py-1 rounded-full text-xs font-bold font-tajawal">
                  محاضرة {schedule.lecture_number}
                </span>
                <span className="text-sm font-bold text-gray-400 font-tajawal">
                  {schedule.day_of_week}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 font-tajawal">
                  {schedule.course_name}
                </h3>
                <p className="text-gray-500 text-sm font-tajawal">
                  د. {schedule.doctor_name}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-[#6B4CE6]" />
                  <span className="text-sm font-medium">
                    {schedule.start_time} - {schedule.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm font-medium font-tajawal">
                    {schedule.room_name}{" "}
                    {schedule.room_location && `- ${schedule.room_location}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6B4CE6]">
                  <GraduationCap size={16} />
                  <span className="text-sm font-bold font-tajawal">
                    {schedule.level}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => openEdit(schedule)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all text-sm font-tajawal"
                >
                  <Edit2 size={14} />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteId(schedule.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-all text-sm font-tajawal"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-tajawal">
                {editSchedule ? "تعديل المحاضرة" : "إضافة محاضرة جديدة"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-tajawal text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                  المادة
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal appearance-none"
                    value={form.course_id}
                    onChange={(e) =>
                      setForm({ ...form, course_id: e.target.value })
                    }
                  >
                    <option value="">اختر المادة</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                  القاعة
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal appearance-none"
                    value={form.room_id}
                    onChange={(e) =>
                      setForm({ ...form, room_id: e.target.value })
                    }
                  >
                    <option value="">اختر القاعة</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.capacity} مقعد)
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                  اليوم
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal appearance-none"
                    value={form.day_of_week}
                    onChange={(e) =>
                      setForm({ ...form, day_of_week: e.target.value })
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                    وقت البداية
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30"
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                    وقت النهاية
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                  رقم المحاضرة
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30"
                  value={form.lecture_number}
                  onChange={(e) =>
                    setForm({ ...form, lecture_number: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={addMutation.isPending || editMutation.isPending}
                className="flex-1 bg-[#6B4CE6] text-white py-3 rounded-xl font-bold font-tajawal hover:bg-[#5A3DD4] transition-all disabled:opacity-50"
              >
                {addMutation.isPending || editMutation.isPending
                  ? "جاري الحفظ..."
                  : editSchedule
                    ? "حفظ التعديلات"
                    : "إضافة المحاضرة"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-tajawal hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 font-tajawal">
              تأكيد الحذف
            </h3>
            <p className="text-gray-500 text-center text-sm font-tajawal">
              هل أنت متأكد من حذف هذه المحاضرة من الجدول؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold font-tajawal hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 py-3 rounded-xl font-tajawal text-gray-600 hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
