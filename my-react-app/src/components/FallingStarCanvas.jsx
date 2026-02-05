import { useEffect, useRef } from "react";

export default function FallingStarCanvas() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const starsRef = useRef([]);
  const STAR_COUNT = 160; // slightly fewer stars to lighten render work

  const createStar = (width, height) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1 + 0.5,
    opacity: Math.random() * 0.8 + 0.2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const stars = starsRef.current;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (stars.length === 0) {
        for (let i = 0; i < STAR_COUNT; i += 1) {
          stars.push(createStar(canvas.width, canvas.height));
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {
          star.x = Math.random() * canvas.width;
          star.y = -10;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      stars.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
