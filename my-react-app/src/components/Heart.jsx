import { useEffect, useRef } from "react";

export default function Heart({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.8,
      delta: (Math.random() - 0.5) * 0.02
    }));

    // ========================= HEART FUNCTION =========================
    function heartPosition(rad) {
      return [
        Math.pow(Math.sin(rad), 3),
        -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
      ];
    }

    // ========================= NORMAL PARTICLES =========================
    const particles = [];
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        target: angle,
        size: 1 + Math.random() * 2.5,
        color: `hsla(${330 + Math.random() * 30}, ${70 + Math.random() * 30}%, ${50 + Math.random() * 30}%, ${0.6 + Math.random() * 0.4})`,
        speedFactor: 0.8 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2
      });
    }


    // ========================= EXPLOSION PARTICLES =========================
    const brokenParticles = [];
    const explode = { current: false }; // dùng object để React không reset

    function explodeHeart() {
      explode.current = true;
      brokenParticles.length = 0;

      for (let i = 0; i < 500; i++) {
        const rad = Math.random() * Math.PI * 2;
        const pos = heartPosition(rad);

        brokenParticles.push({
          x: pos[0] * 150 + canvas.width / 2,
          y: pos[1] * 10 + canvas.height / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: -Math.random() * 8,
          size: 2 + Math.random() * 2,
          alpha: 1
        });
      }
    }

    window.explodeHeart = explodeHeart;

    // ========================= ANIMATION LOOP =========================
    let time = 0;

    let animationFrameId;

    function animate() {
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);


      const beat = Math.sin(time * 2.5);
      const scale = 1 + 0.12 * beat;

      // ========================= NORMAL HEART =========================
      if (!explode.current) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, 200
        );
        gradient.addColorStop(0, "rgba(255, 50, 80, 0.3)");
        gradient.addColorStop(0.5, "rgba(255, 20, 60, 0.15)");
        gradient.addColorStop(1, "rgba(255, 0, 40, 0.05)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += 0.01) {
          const pos = heartPosition(i);
          const x = pos[0] * 150 * scale + canvas.width / 2;
          const y = pos[1] * 10 * scale + canvas.height / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 100, 120, ${0.3 + beat * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ========================= NORMAL PARTICLES (chỉ chạy khi chưa explode) =========================
      if (!explode.current) {
        for (let p of particles) {
          const wobble = Math.sin(time * 3 + p.offset) * 0.02;
          const targetAngle = p.target + wobble;
          const pos = heartPosition(targetAngle);
          const tx = pos[0] * 150 * scale + canvas.width / 2;
          const ty = pos[1] * 10 * scale + canvas.height / 2;

          const dx = tx - p.x;
          const dy = ty - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          p.vx += (dx / dist) * 0.5 * p.speedFactor;
          p.vy += (dy / dist) * 0.5 * p.speedFactor;

          p.x += p.vx;
          p.y += p.vy;

          p.vx *= 0.85;
          p.vy *= 0.85;

          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          p.target += 0.002;
        }
      }

      // =========================  EXPLOSION PARTICLES (rơi xuống) =========================
      if (explode.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(10,3,5)"; // màu nền đặc, giống lúc ban đầu
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let s of stars) {
          s.alpha += s.delta;
          if (s.alpha > 1 || s.alpha < 0.2) s.delta *= -1;

          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let p of brokenParticles) {
          p.vy += 0.15; // gravity
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.005;

          ctx.fillStyle = `rgba(255, 100, 120, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += 0.04;
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);


  return <canvas ref={canvasRef} className={className}/>;
}
