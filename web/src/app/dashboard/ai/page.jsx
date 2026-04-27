"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Bot, User, Trash2, Sparkles, GraduationCap } from "lucide-react";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

const SUGGESTIONS = [
  "كشف تعارضات الجدول الحالي",
  "اشرح لي خوارزمية الجدولة التلقائية",
  "ما هي أكثر القاعات استخداماً؟",
  "كيف أضيف مادة جديدة للنظام؟",
  "ما الفرق بين دور المدير ودور الأدمن؟",
  "كيف يكشف النظام التعارضات؟",
];

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "مرحباً! أنا مساعدك الذكي في نظام My Guide لإدارة الجداول الجامعية 🎓\n\nيمكنني مساعدتك في:\n• شرح النظام وميزاته\n• الإجابة على أسئلة الجدولة\n• نصائح لإدارة المواد والقاعات\n• فهم خوارزميات كشف التعارضات\n\nبماذا يمكنني مساعدتك؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  const { data: stats } = useQuery({
    queryKey: ["ai-stats"],
    queryFn: async () => {
      const [courses, rooms, conflicts] = await Promise.all([
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/rooms").then((r) => r.json()),
        fetch("/api/conflicts").then((r) => r.json()),
      ]);
      return { courses, rooms, conflicts };
    },
  });

  const handleFinish = useCallback((msg) => {
    setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    setStreaming("");
    setIsLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreaming,
    onFinish: handleFinish,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const systemPrompt = `أنت مساعد ذكي متخصص في نظام إدارة الجداول الجامعية "My Guide". 

معلومات النظام الحالية:
- عدد المواد: ${stats?.courses?.length || "غير معروف"}
- عدد القاعات: ${stats?.rooms?.length || "غير معروف"}
- عدد التعارضات: ${stats?.conflicts?.conflict_count ?? "غير معروف"}

النظام يدعم 4 أدوار: طالب، دكتور، مدير، أدمن.
يستخدم خوارزمية Greedy للجدولة التلقائية وخوارزمية O(n²) لكشف التعارضات.

أجب دائماً باللغة العربية بشكل مختصر وواضح. استخدم الرموز التعبيرية لتحسين القراءة.`;

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isLoading) return;

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreaming("");

    try {
      const apiMessages = [
        { role: "user", content: systemPrompt },
        {
          role: "assistant",
          content:
            "فهمت! سأساعدك بكل ما يتعلق بنظام My Guide للجداول الجامعية.",
        },
        ...newMessages,
      ];

      const res = await fetch("/integrations/anthropic-claude-sonnet-4/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, stream: true }),
      });

      handleStreamResponse(res);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "تمت مسح المحادثة. كيف يمكنني مساعدتك؟ 😊",
      },
    ]);
    setStreaming("");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-tajawal">
            المساعد الذكي
          </h1>
          <p className="text-gray-500 mt-1 font-tajawal">
            مدعوم بـ Claude AI من Anthropic
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden md:flex items-center gap-4 bg-white rounded-xl px-4 py-2 border border-gray-100">
              <span className="text-xs text-gray-500 font-tajawal">
                📚 {stats.courses?.length} مادة · 🏫 {stats.rooms?.length} قاعة
                ·{" "}
                <span
                  className={
                    stats.conflicts?.conflict_count > 0
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  ⚠️ {stats.conflicts?.conflict_count} تعارض
                </span>
              </span>
            </div>
          )}
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            title="مسح المحادثة"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-[#6B4CE6]" : "bg-gray-200"}`}
              >
                {msg.role === "assistant" ? (
                  <Bot size={18} className="text-white" />
                ) : (
                  <User size={18} className="text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-tajawal leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "bg-gray-50 text-gray-800 rounded-tr-sm" : "bg-[#6B4CE6] text-white rounded-tl-sm"}`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streaming && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#6B4CE6] flex items-center justify-center shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="max-w-[80%] bg-gray-50 px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-tajawal leading-relaxed text-gray-800 whitespace-pre-wrap">
                {streaming}
                <span className="inline-block w-1.5 h-4 bg-[#6B4CE6] animate-pulse mr-1 rounded-sm" />
              </div>
            </div>
          )}

          {/* Loading dots */}
          {isLoading && !streaming && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#6B4CE6] flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tr-sm flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400 font-tajawal mb-2 flex items-center gap-1">
              <Sparkles size={12} /> اقتراحات:
            </p>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 bg-purple-50 text-[#6B4CE6] rounded-full text-xs font-tajawal hover:bg-purple-100 transition-all border border-purple-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3 font-tajawal text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4CE6]/30 text-right"
              placeholder="اكتب سؤالك هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-[#6B4CE6] text-white p-3 rounded-xl hover:bg-[#5A3DD4] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
