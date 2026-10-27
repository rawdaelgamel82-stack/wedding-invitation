"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  FaHeart,
  FaVolumeMute,
  FaMapMarkerAlt,
  FaMagic,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaUserCheck,
} from "react-icons/fa";
import { GiFlowers } from "react-icons/gi";
import Guestbook from "./components/Guestbook/Guestbook";

import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

type Wish = { name: string; wish: string };
type Flower = {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  delay: number;
};

const INITIAL_WISHES: Wish[] = [
  {
    name: "روضه",
    wish: "ألف مبروك يا حبايبي! ربنا يتمملكم على خير ويكتبلكم كل السعادة والتوفيق يا رب",
  },
];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [flowerExplosion, setFlowerExplosion] = useState<Flower[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [guestName, setGuestName] = useState("");
  const [guestWish, setGuestWish] = useState("");
  const [wishesList, setWishesList] = useState<Wish[]>(INITIAL_WISHES);
  const [showWishSuccess, setShowWishSuccess] = useState(false);

  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpAttending, setRsvpAttending] = useState("yes");
  const [rsvpGuestCount, setRsvpGuestCount] = useState("1");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Alex+Brush&family=Great+Vibes&family=Amiri:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  useEffect(() => {
    const targetDate = new Date("2026-11-08T19:30:00+02:00").getTime();
    const updateTimer = () => {
      const difference = Math.max(0, targetDate - Date.now());
      setTimeLeft({
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference % 86_400_000) / 3_600_000),
        minutes: Math.floor((difference % 3_600_000) / 60_000),
        seconds: Math.floor((difference % 60_000) / 1_000),
      });
    };
    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let frameId = 0;
    const petals = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 11 + 7,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX;
        petal.rotation += petal.rotSpeed;
        if (petal.y > height + 20) {
          petal.y = -20;
          petal.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate((petal.rotation * Math.PI) / 180);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = "#f78da7";
        ctx.beginPath();
        ctx.moveTo(0, -petal.size);
        ctx.quadraticCurveTo(
          petal.size * 0.85,
          -petal.size * 0.35,
          0,
          petal.size,
        );
        ctx.quadraticCurveTo(
          -petal.size * 0.85,
          -petal.size * 0.35,
          0,
          -petal.size,
        );
        ctx.fill();
        ctx.restore();
      });
      frameId = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    render();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleOpenInvitation = () => {
    if (isOpeningAnimation || isOpen) return;
    setIsOpeningAnimation(true);
    setFlowerExplosion(
      Array.from({ length: 36 }, (_, id) => ({
        id,
        x: (Math.random() - 0.5) * 320,
        y: -Math.random() * 260 - 50,
        scale: Math.random() * 0.9 + 0.6,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.4,
      })),
    );

    window.setTimeout(() => {
      setIsOpen(true);
      setIsOpeningAnimation(false);
      const audio = audioRef.current;
      if (audio) {
        void audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 1200);
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
    }
  };

  const handleSendWish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = guestName.trim();
    const wish = guestWish.trim();
    if (!name || !wish) return;
    setWishesList((current) => [{ name, wish }, ...current]);
    setGuestName("");
    setGuestWish("");
    setShowWishSuccess(true);
    window.setTimeout(() => setShowWishSuccess(false), 3000);
  };

  const handleRsvpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRsvpSubmitted(true);
  };

  return (
    <div className="relative flex min-h-screen justify-center overflow-x-hidden bg-transparent font-sans text-[#6d3243]">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />
      <audio
        ref={audioRef}
        loop
        preload="none"
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-piano-112200.mp3"
      />

      <main className="relative z-10 flex min-h-screen w-full max-w-md flex-col overflow-hidden border-x border-[#f2cfd9] bg-transparent shadow-2xl">
        {isOpen && (
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isPlaying ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
            className="music-button  fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-[#c47185] text-white shadow-xl transition hover:bg-[#b05c71] active:scale-95 sm:absolute sm:bottom-6 sm:right-6"
          >
            {isPlaying ? (
              <span className="text-xl">♫</span>
            ) : (
              <FaVolumeMute size={20} />
            )}
          </button>
        )}

        {!isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#e89cae] via-[#d18296] to-[#b86277] p-4">
            <div
              className={`relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-md transition-all duration-700 ${isOpeningAnimation ? "scale-105 opacity-80" : "scale-100 opacity-100"}`}
            >
              <div
                className="absolute left-0 top-0 h-24 w-24 rounded-tl-3xl bg-[#e8a2b5]/20"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 right-0 h-24 w-24 rounded-br-3xl bg-[#e8a2b5]/20"
                aria-hidden="true"
              />
              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#c47185] text-white shadow-md">
                <FaHeart size={30} />
              </div>
              <div
                className="relative mb-1 text-5xl leading-relaxed text-[#a0485d]"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Ebrahim
              </div>
              <div
                className="my-1 text-3xl text-[#c47185]"
                style={{ fontFamily: "'Alex Brush', cursive" }}
              >
                &amp;
              </div>
              <div
                className="relative mb-6 text-5xl leading-relaxed text-[#a0485d]"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Nada
              </div>
              <div className="mb-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-[#dfa2b0]" />
                <div className="h-2 w-2 rounded-full bg-[#c47185]" />
                <div className="h-px w-12 bg-[#dfa2b0]" />
              </div>
              <p className="mb-1 font-serif text-xl font-medium text-[#7d3b4d]">
                November 8, 2026
              </p>
              <p
                className="mb-8 text-2xl text-[#a36374]"
                style={{ fontFamily: "'Alex Brush', cursive" }}
              >
                Cordially Invites
              </p>
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={handleOpenInvitation}
                  disabled={isOpeningAnimation}
                  className="relative z-10 w-36 rounded-full bg-[#c47185] py-3 font-serif text-lg font-semibold text-white shadow-md transition hover:bg-[#b05c71] active:scale-95 disabled:opacity-70"
                >
                  Open
                </button>
                {isOpeningAnimation && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0">
                    {flowerExplosion.map((flower) => (
                      <span
                        key={flower.id}
                        className="absolute text-2xl text-pink-400"
                        style={{
                          transform: `translate(${flower.x}px, ${flower.y}px) scale(${flower.scale}) rotate(${flower.rotate}deg)`,
                          transition: `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${flower.delay}s`,
                        }}
                      >
                        ✿
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="relative flex flex-1 flex-col space-y-10 px-4 py-6 text-center">
            <section className="relative pt-6 px-6">
              {/* وردة الزاوية اليمنى العليا (مكبرة) */}
              <div className="absolute -top-10 -right-16 -z-10 pointer-events-none w-70 h-70">
                <Image
                  src="/images/flower1.png"
                  alt="Top Right Flower"
                  fill
                  sizes="(max-width: 768px) 250px, 200px" /* ضفنا السطر ده */
                  className="object-contain"
                />
              </div>

              <div className="absolute -bottom-10 -left-10 -z-10 pointer-events-none w-44 h-44">
                <Image
                  src="/images/flower2.png"
                  alt="Bottom Left Flower"
                  fill
                  sizes="(max-width: 768px) 150px, 200px" /* وضفناه هنا كمان */
                  className="object-contain"
                />
              </div>

              {/* باقي محتوى السكشن زي ما هو */}
              <div className="mb-4 bg-white/80 inline-block rounded-sm border border-amber-300/60 p-1">
                <div className="border border-amber-300/40 px-6 py-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#a85268]">
                    THE WEDDING OF
                  </h3>
                </div>
              </div>

              <h1
                className="mb-1 text-6xl leading-snug text-[#a0485d]"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Ebrahim
              </h1>
              <span
                className="my-1 block text-3xl text-[#c47185]"
                style={{ fontFamily: "'Alex Brush', cursive" }}
              >
                &amp;
              </span>
              <h1
                className="mb-6 text-6xl leading-snug text-[#a0485d]"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Nada
              </h1>
            </section>
            <section className="relative pt-8 pb-6 px-6 my-8 rounded-3xl mb-20  ">
              <div className="absolute bottom-0 right-0 -z-10 pointer-events-none w-40 h-40">
                <Image
                  src="/images/flower3.png"
                  alt="Bottom Right Flower"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-contain"
                />
              </div>

              {/* محتوى السكشن الجديد (مخليناه z-10 عشان يكون فوق الورود) */}
              <div className="relative z-10">
                <section className="relative pt-12 pb-8 px-6 my-8 rounded-3xl">
                  {/* وردة اليسار */}
                  <div className="absolute  -top-1 -left-12 -translate-y-1/2 -z-10 pointer-events-none w-48 h-48">
                    <Image
                      src="/images/try.png"
                      alt="Left Flower"
                      fill
                      sizes="(max-width: 768px) 150px, 200px"
                      className="object-contain"
                    />
                  </div>

                  {/* وردة اليمين */}
                  <div className="absolute -top-1 -right-12 -translate-y-1/2 -z-10 pointer-events-none w-48 h-48">
                    <Image
                      src="/images/try2.png"
                      alt="Right Flower"
                      fill
                      sizes="(max-width: 768px) 150px, 200px"
                      className="object-contain"
                    />
                  </div>

                  {/* صندوق النص والدعوة في المنتصف */}
                  <div className="relative z-10 text-center my-4 mx-auto max-w-xs px-4 py-4 rounded-lg">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-[#7d3b4d]">
                      TOGETHER WITH THEIR FAMILIES
                    </span>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#a36374]">
                      Ibrahim & Nada
                      <br />
                      INVITE YOU TO CELEBRATE THEIR WEDDING
                    </p>
                  </div>
                </section>

                <div className="my-6 space-y-4">
                  <div>
                    <h2
                      className="text-4xl text-[#8f394f]"
                      style={{ fontFamily: "'Great Vibes', cursive" }}
                    >
                      Ebrahim
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#b87082]">
                      GROOM
                    </span>
                  </div>
                  <div
                    className="text-2xl text-[#c47185]"
                    style={{ fontFamily: "'Alex Brush', cursive" }}
                  >
                    &amp;
                  </div>
                  <div>
                    <h2
                      className="text-4xl text-[#8f394f]"
                      style={{ fontFamily: "'Great Vibes', cursive" }}
                    >
                      Nada
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#b87082]">
                      BRIDE
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute mt-10 -bottom-60 left-1/2 -translate-x-1/2 -z-10 pointer-events-none w-80 h-80">
                <Image
                  src="/images/try3.png"
                  alt="Bottom Center Flower"
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-contain"
                />
              </div>
            </section>

            <section className="space-y-3 mt-20">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#a85268]">
                PHOTO GALLERY
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white bg-pink-50 shadow-md">
                  <Image
                    src="/images/frist.png"
                    alt="Ebrahim and Nada"
                    fill
                    sizes="(max-width: 448px) 45vw, 200px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="relative row-span-2 min-h-[300px] overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md">
                  <Image
                    src="/images/thrid.png"
                    alt="Ebrahim and Nada in wedding attire"
                    fill
                    sizes="(max-width: 448px) 45vw, 200px"
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/85 p-1.5 text-center font-serif text-[10px] italic text-[#8f394f] shadow-sm">
                    Forever &amp; Always 💕
                  </div>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-white bg-pink-50 shadow-md">
                  <Image
                    src="/images/second.png"
                    alt="Ebrahim and Nada photo"
                    fill
                    sizes="(max-width: 448px) 45vw, 200px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-[#f5d0dc] bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#a85268]">
                WEDDING PARTY INFO
              </h3>
              <div className="flex items-center justify-center gap-3 text-sm font-semibold text-[#8f394f]">
                <span>SUNDAY</span>
                <span className="border-x border-[#c47185] px-3 text-2xl font-bold text-[#c47185]">
                  08
                </span>
                <span>NOVEMBER</span>
              </div>
              <div className="text-xs font-bold tracking-widest text-[#8f394f]">
                2026
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#f2cfd9] pt-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#b87082]">
                    RECEPTION
                  </span>
                  <span className="text-sm font-bold text-[#7d3b4d]">
                    7:00 PM
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#b87082]">
                    CEREMONY
                  </span>
                  <span className="text-sm font-bold text-[#7d3b4d]">
                    8:00 PM
                  </span>
                </div>
              </div>
              <div className="border-t border-[#f2cfd9] pt-4">
                <span className="mb-1 block text-xs font-bold tracking-widest text-[#a85268]">
                  COUNTDOWN TO THE BIG DAY
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2 text-[#7d3b4d]">
                  {(
                    [
                      [timeLeft.days, "أيام"],
                      [timeLeft.hours, "ساعات"],
                      [timeLeft.minutes, "دقائق"],
                      [timeLeft.seconds, "ثواني"],
                    ] as const
                  ).map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-pink-100 bg-pink-50 p-2"
                    >
                      <span className="block text-lg font-bold">{value}</span>
                      <span className="text-[10px] text-[#b87082]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#f5d0dc] bg-white/80 p-6 shadow-sm">
              <div className="rounded-2xl border border-amber-300/70 p-4">
                <h4 className="mb-4 text-sm font-bold text-[#8f394f]">
                  November 2026
                </h4>
                <div className="mb-2 grid grid-cols-7 text-[11px] font-bold text-[#b87082]">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-xs font-medium text-[#7d3b4d]">
                  {Array.from({ length: 35 }, (_, index) => {
                    const day = index + 1;
                    if (day > 30)
                      return <span key={index} aria-hidden="true" />;
                    return (
                      <span
                        key={index}
                        className="flex items-center justify-center"
                      >
                        {day === 8 ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c47185] text-xs font-bold text-white shadow-sm">
                            8
                          </span>
                        ) : (
                          day
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-6 border-t border-amber-200/50 pt-3">
                  <a
                    href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=WEDDING%20of%20Ebrahim%20%26%20Nada&dates=20261108T193000/20261108T230000&ctz=Africa%2FCairo"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-semibold text-[#c47185] underline hover:text-[#a0485d]"
                  >
                    Add to Calendar
                  </a>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-[#f5d0dc] bg-white/80 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#a85268]">
                WEDDING PARTY VENUE
              </h3>

              <p className="text-base font-bold text-[#8f394f]">
                قاعة روتانا هاي كلاس - Rotana High Class
              </p>

              <div className="overflow-hidden rounded-2xl border border-[#f5d0dc]">
                <iframe
                  src="https://maps.google.com/maps?q=Rotana%20High%20Class%2C%20Tanta%2C%20Egypt&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  title="Rotana High Class Wedding Venue"
                />
              </div>

              <a
                href="https://maps.app.goo.gl/C22Yjr8YHUvWo2ky9?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#c47185] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#a0485d]"
              >
                <FaMapMarkerAlt size={16} />
                فتح الموقع الأصلي على Google Maps
              </a>
            </section>

            <Guestbook />
          </div>
        )}
        <footer className="mt-auto border-t border-[#f2cfd9] bg-white/40 px-5 py-8 text-center rounded-3xl m-3">
          {/* Small decorative heart */}
          <div className="mb-3 flex justify-center">
            <FaHeart className="text-[#c47185]" size={18} />
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a85268]">
            Crafted with love by
          </p>

          <p
            className="text-3xl text-[#a0485d]"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Rawda Elgamel
          </p>

          <p className="mt-2 text-xs font-medium tracking-wide text-[#8f394f]">
            Frontend Developer
          </p>

          <div className="mt-5 flex items-center justify-center gap-5">
            <a
              href="https://github.com/rawdaelgamel82-stack"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f2cfd9] text-[#a85268] transition duration-300 hover:-translate-y-1 hover:bg-[#fceef1]"
            >
              <FaGithub size={19} />
            </a>

            <a
              href="https://www.linkedin.com/in/rawda-elgamel-5394123a6/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f2cfd9] text-[#a85268] transition duration-300 hover:-translate-y-1 hover:bg-[#fceef1]"
            >
              <FaLinkedin size={19} />
            </a>

            <a
              href="https://www.instagram.com/rawda_elgamel/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f2cfd9] text-[#a85268] transition duration-300 hover:-translate-y-1 hover:bg-[#fceef1]"
            >
              <FaInstagram size={19} />
            </a>
          </div>

          <div className="mx-auto mt-6 h-px w-16 bg-[#e8bdc8]" />

          <p className="mt-4 text-[10px] text-[#b17b88]">
            © 2026 · All rights reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
