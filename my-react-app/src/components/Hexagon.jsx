import { useState, useEffect } from "react";
import FallingStarCanvas from "./FallingStarCanvas";
import { HeartIcon, ChatBubbleBottomCenterIcon, LockClosedIcon, UserCircleIcon, CalendarIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function HexagonAutoSpin() {
  const faceWidth = 400; 
  const faces = 6;
  const angle = 360 / faces; 
  const [rotation, setRotation] = useState(0);
  const translateZ = faceWidth / (2 * Math.tan(Math.PI / faces) * 0.95);

 
  const faceData = [
    { title: "Tìm bạn tâm giao", icon: HeartIcon, color: "text-pink-400" },
    { title: "Gợi ý phù hợp", icon: SparklesIcon, color: "text-yellow-400" },
    { title: "Trò chuyện an toàn", icon: ChatBubbleBottomCenterIcon, color: "text-blue-400" },
    { title: "Hồ sơ cá nhân", icon: UserCircleIcon, color: "text-green-400" },
    { title: "Sự kiện & ngày đặc biệt", icon: CalendarIcon, color: "text-purple-400" },
    { title: "Bảo mật & quyền riêng tư", icon: LockClosedIcon, color: "text-red-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev - angle);
    }, 2000); 

    return () => clearInterval(interval);
  }, [angle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white relative overflow-hidden">
      <div className="absolute w-full h-full top-0 left-0 z-0">
        <FallingStarCanvas />
      </div>

      <div className="scene w-[400px] h-[300px] [perspective:1000px] mx-auto mt-10 flex justify-center items-center relative">
        <div
          className="hexagon w-[400px] h-[300px] relative [transform-style:preserve-3d] transition-transform duration-700"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          {faceData.map((face, i) => {
            const Icon = face.icon;
            return (
              <div
                key={i}
                className="face absolute w-[400px] h-[300px] flex flex-col justify-center items-center border-2 border-yellow-500 bg-white/10 backdrop-blur-md rounded-lg p-4 text-center"
                style={{ transform: `rotateY(${i * angle}deg) translateZ(${translateZ}px)` }}
              >
                <Icon className={`w-12 h-12 mb-2 ${face.color}`} />
                <p className="text-white font-semibold">{face.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
