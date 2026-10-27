"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { FaHeart, FaMagic, FaCheckCircle } from "react-icons/fa";
import { GiFlowers } from "react-icons/gi";
import { supabase } from "@/app/lip/supabase";

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export default function Guestbook() {
  const [guestName, setGuestName] = useState("");
  const [guestWish, setGuestWish] = useState("");
  const [latestWish, setLatestWish] = useState<Wish | null>(null);
  const [showWishSuccess, setShowWishSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLatestWish() {
      const { data, error } = await supabase
        .from("guestbook_messages")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        setError("حصلت مشكلة في تحميل المباركات.");
      } else {
        setLatestWish(data?.[0] ?? null);
      }

      setLoading(false);
    }

    loadLatestWish();
  }, []);

  async function handleSendWish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = guestName.trim();
    const message = guestWish.trim();

    if (!name || !message || sending) return;

    setSending(true);
    setError("");
    setShowWishSuccess(false);

    const { data, error } = await supabase
      .from("guestbook_messages")
      .insert([{ name, message }])
      .select("id, name, message, created_at")
      .single();

    if (error) {
      setError("ملقيناش نقدر نحفظ المباركة دلوقتي. حاولي تاني.");
    } else {
      setLatestWish(data);
      setGuestName("");
      setGuestWish("");
      setShowWishSuccess(true);
    }

    setSending(false);
  }

  return (
    <section
      className="rounded-3xl border border-[#f5d0dc] bg-white/80 p-6 text-right shadow-sm"
      dir="rtl"
    >
      <h3 className="mb-6 flex items-center justify-center gap-2 text-center text-xs font-bold uppercase tracking-widest text-[#a85268]">
        <FaHeart size={18} />
        GUESTBOOK / دفتر المباركات
      </h3>

      <form onSubmit={handleSendWish} className="space-y-4">
        <input
          type="text"
          required
          maxLength={80}
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="الاسم *"
          className="w-full rounded-xl border border-[#f2cfd9] bg-[#fffcfc] px-4 py-3 text-sm text-[#6d3243] placeholder-[#c892a0] focus:outline-none focus:ring-2 focus:ring-[#c47185]"
        />

        <textarea
          rows={3}
          required
          maxLength={500}
          value={guestWish}
          onChange={(event) => setGuestWish(event.target.value)}
          placeholder="اكتب تهنئتك ومباركتك للعريسين إبراهيم وندى*"
          className="w-full resize-none rounded-xl border border-[#f2cfd9] bg-[#fffcfc] px-4 py-3 text-sm text-[#6d3243] placeholder-[#c892a0] focus:outline-none focus:ring-2 focus:ring-[#c47185]"
        />

        <div className="flex items-center gap-2 pt-2">
          <div className="rounded-xl border border-pink-100 bg-pink-50 p-2.5 text-[#c47185]">
            <FaMagic size={18} />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#c47185] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#b05c71] disabled:opacity-60"
          >
            <span>{sending ? "جاري الإرسال..." : "إرسال المباركة"}</span>
            <GiFlowers size={16} />
          </button>
        </div>
      </form>

      {showWishSuccess && (
        <div
          role="status"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-pink-300 bg-pink-100/90 p-3 text-center text-xs font-semibold text-[#8f394f]"
        >
          <FaCheckCircle size={18} />
          تم حفظ مباركتك بنجاح، شكرًا لمشاعركم الجميله هنستناكو فى الفرح{" "}
          <FaHeart size={12} className="fill-[#c47185] text-[#c47185]" />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-[#f2cfd9] pt-4">
        {loading ? (
          <p className="py-4 text-center text-xs text-[#a85268]">
            جاري تحميل آخر مباركة...
          </p>
        ) : latestWish ? (
          <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4">
            <span className="mb-2 flex items-center justify-between text-xs font-bold text-[#a0485d]">
              <span>{latestWish.name}</span>
              <FaHeart size={12} className="fill-[#c47185] text-[#c47185]" />
            </span>
            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-[#7d3b4d]">
              {latestWish.message}
            </p>
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-[#a85268]">
            لسه مفيش مباركات. كوني أول من يكتب تهنئة!
          </p>
        )}

        <Link
          href="/wishes"
          className="mt-4 flex w-full items-center justify-center rounded-full border border-[#c47185] py-3 text-xs font-bold text-[#a85268] transition hover:bg-pink-50"
        >
          عرض كل المباركات
        </Link>
      </div>
    </section>
  );
}
