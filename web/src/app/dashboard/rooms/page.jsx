"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  DoorOpen,
} from "lucide-react";
import { useState } from "react";

export default function RoomsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/rooms");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            إدارة القاعات
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            إضافة وتعديل بيانات القاعات والمدرجات
          </p>
        </div>
        <button className="bg-[#6B4CE6] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#6B4CE6]/30 font-tajawal font-bold hover:bg-[#5A3DD4] transition-all flex items-center justify-center gap-2">
          <Plus size={20} />
          إضافة قاعة جديدة
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="البحث باسم القاعة..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/20 font-tajawal text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all font-tajawal">
            <Filter size={20} />
            تصفية
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 font-tajawal">
                  اسم القاعة
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 font-tajawal">
                  الموقع
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 font-tajawal">
                  السعة
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 font-tajawal">
                  الحالة
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 font-tajawal">
                  العمليات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms?.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-gray-50/50 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <DoorOpen size={20} />
                      </div>
                      <span className="font-bold text-gray-900 font-tajawal">
                        {room.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-tajawal">
                    {room.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-tajawal">
                    {room.capacity} طالب
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-tajawal ${
                        room.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {room.status === "available" ? "متاحة" : "مشغولة"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
