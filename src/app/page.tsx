"use client";
import { useEffect, useRef, useState } from "react";

type AbsenUser = {
  uniqueId: string;
  nickname: string;
  profilePictureUrl: string;
};

const KEYWORDS = ["absen", "hi", "halo", "lorem"];

export default function Home() {
  const [absenList, setAbsenList] = useState<AbsenUser[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:62024");

    ws.onopen = () => {
      console.log("Terhubung ke WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        const { event: evt, data: eventData } = message;

        if (evt === "chat") {
          const comment = eventData.comment?.toLowerCase() || "";
          const alreadyAbsen = absenList.some(
            (user) => user.uniqueId === eventData.uniqueId
          );

          if (
            !alreadyAbsen &&
            KEYWORDS.some((keyword) => comment.includes(keyword))
          ) {
            const newUser: AbsenUser = {
              uniqueId: eventData.uniqueId,
              nickname: eventData.nickname,
              profilePictureUrl: eventData.profilePictureUrl,
            };

            setAbsenList((prev) => [...prev, newUser]);
          }
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [absenList]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [absenList]);

  return (
    <div>
      <div className="bg-black rounded-xl shadow-lg w-full max-w-md p-4">
        <h1 className="text-xl font-semibold text-center mb-4 text-white">
          📋 Daftar Absensi TikTok
        </h1>
        <div
          ref={containerRef}
          className="max-h-56 overflow-y-auto scroll-smooth space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {absenList.map((user) => (
            <div
              key={user.uniqueId}
              className="flex items-center space-x-3 border-b pb-2">
              <img
                src={user.profilePictureUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  {user.nickname}
                </p>
                <p className="text-green-300 text-sm">Hadir mas ✅</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
