"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { supabase } from "@/app/lip/supabase";

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export default function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWishes() {
      const { data, error } = await supabase
        .from("guestbook_messages")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError("حصلت مشكلة في تحميل المباركات.");
      } else {
        setWishes(data ?? []);
      }

      setLoading(false);
    }

    loadWishes();
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-[#fff8fa] px-4 py-10 text-right">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <FaHeart className="mx-auto mb-4 text-3xl text-[#c47185]" />

          <h1 className="text-2xl font-bold text-[#a85268]">
            دفتر مباركات إبراهيم وندى
          </h1>

          <p className="mt-3 text-sm text-[#9c6574]">
            كل كلمات الحب والفرحة اللي شاركتونا بيها
          </p>
        </header>

        <Link
          href="/"
          className="mb-6 inline-block rounded-full border border-[#c47185] px-5 py-2 text-sm font-semibold text-[#a85268] hover:bg-[#b05c71] transition hover:bg-pink-50"
        >
          العودة للدعوة
        </Link>

        {loading ? (
          <p className="py-10 text-center text-[#a85268]">
            جاري تحميل المباركات...
          </p>
        ) : error ? (
          <p role="alert" className="py-10 text-center text-red-600">
            {error}
          </p>
        ) : wishes.length === 0 ? (
          <p className="rounded-2xl border border-pink-100 bg-white p-8 text-center text-[#a85268]">
            لسه مفيش مباركات. كونوا أول من يشارك الفرحة!
          </p>
        ) : (
          <>
            <p className="mb-4 text-xs text-[#a85268]">
              عدد المباركات: {wishes.length}
            </p>

            <div className="space-y-4">
              {wishes.map((wish) => (
                <article
                  key={wish.id}
                  className="rounded-2xl border border-[#f5d0dc] bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="font-bold text-[#a0485d]">{wish.name}</h2>

                    <FaHeart className="shrink-0 text-[#c47185]" />
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#7d3b4d]">
                    {wish.message}
                  </p>

                  <p className="mt-3 text-left text-xs text-[#b88b97]">
                    {new Date(wish.created_at).toLocaleString("ar-EG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
