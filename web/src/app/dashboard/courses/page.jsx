"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  GraduationCap,
  X,
  ChevronDown,
  BookOpen,
  Users,
} from "lucide-react";

const LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4"];

export default function CoursesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({
    name: "",
    level: "Level 1",
    doctor_id: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("فشل في جلب المواد");
      return res.json();
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error("فشل في جلب الدكاترة");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل في إضافة المادة");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries(["courses"]);
      setShowModal(false);
      setForm({ name: "", level: "Level 1", doctor_id: "" });
      setError("");
    },
    onError: (e) => setError(e.message),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل في تحديث المادة");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries(["courses"]);
      setShowModal(false);
      setEditCourse(null);
      setForm({ name: "", level: "Level 1", doctor_id: "" });
      setError("");
    },
    onError: (e) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل في الحذف");
    },
    onSuccess: () => {
      qc.invalidateQueries(["courses"]);
      setDeleteId(null);
    },
  });

  const openAdd = () => {
    setEditCourse(null);
    setForm({ name: "", level: "Level 1", doctor_id: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      name: course.name,
      level: course.level,
      doctor_id: String(course.doctor_id),
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError("اسم المادة مطلوب");
      return;
    }
    if (!form.doctor_id) {
      setError("يرجى اختيار دكتور");
      return;
    }
    const data = {
      name: form.name,
      level: form.level,
      doctor_id: Number(form.doctor_id),
    };
    if (editCourse) {
      editMutation.mutate({ id: editCourse.id, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const levelColors = {
    "Level 1": "bg-blue-100 text-blue-700",
    "Level 2": "bg-green-100 text-green-700",
    "Level 3": "bg-orange-100 text-orange-700",
    "Level 4": "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            إدارة المواد
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            إضافة وتعديل وحذف المواد الدراسية
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#6B4CE6] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#6B4CE6]/30 font-tajawal font-bold hover:bg-[#5A3DD4] transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة مادة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "إجمالي المواد",
            value: courses.length,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "الدكاترة",
            value: doctors.length,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "الفرقة الثالثة",
            value: courses.filter((c) => c.level === "Level 3").length,
            color: "bg-orange-50 text-orange-600",
          },
          {
            label: "الفرقة الرابعة",
            value: courses.filter((c) => c.level === "Level 4").length,
            color: "bg-green-50 text-green-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl ${s.color.split(" ")[0]} border border-gray-100 bg-white`}
          >
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className={`text-sm font-tajawal mt-1 ${s.color.split(" ")[1]}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-[#6B4CE6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-tajawal text-lg">لا توجد مواد بعد</p>
          <button
            onClick={openAdd}
            className="mt-4 text-[#6B4CE6] font-bold font-tajawal hover:underline"
          >
            إضافة أول مادة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all border-r-4 border-r-[#6B4CE6]"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <GraduationCap size={24} className="text-[#6B4CE6]" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-tajawal ${levelColors[course.level] || "bg-gray-100 text-gray-600"}`}
                >
                  {course.level}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-tajawal mt-4">
                {course.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <Users size={16} />
                <span className="text-sm font-tajawal">
                  {course.doctor_name}
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEdit(course)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-[#6B4CE6] text-[#6B4CE6] hover:bg-purple-50 transition-all font-tajawal text-sm font-medium"
                >
                  <Edit2 size={16} />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteId(course.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-tajawal text-sm font-medium"
                >
                  <Trash2 size={16} />
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
              <h2 className="text-xl font-bold text-gray-900 font-tajawal">
                {editCourse ? "تعديل المادة" : "إضافة مادة جديدة"}
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
                  اسم المادة
                </label>
                <input
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal"
                  placeholder="مثال: قواعد البيانات"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 font-tajawal mb-1 block">
                  الفرقة / المستوى
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal appearance-none"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l === "Level 1"
                          ? "الأولى"
                          : l === "Level 2"
                            ? "الثانية"
                            : l === "Level 3"
                              ? "الثالثة"
                              : "الرابعة"}
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
                  الدكتور
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 font-tajawal appearance-none"
                    value={form.doctor_id}
                    onChange={(e) =>
                      setForm({ ...form, doctor_id: e.target.value })
                    }
                  >
                    <option value="">اختر الدكتور</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
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
                  : editCourse
                    ? "حفظ التعديلات"
                    : "إضافة المادة"}
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

      {/* Delete Confirmation */}
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
              هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الجداول المرتبطة بها
              أيضاً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold font-tajawal hover:bg-red-600 transition-all disabled:opacity-50"
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
