"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'firework' | 'confetti' | 'star';
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
}

export function NewYearParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 10);
      particles = [];
      const colors = ['#ffd700', '#ff6347', '#4169e1', '#32cd32', '#ff1493', '#00ced1'];
      
      for (let i = 0; i < particleCount; i++) {
        const types: ('firework' | 'confetti' | 'star')[] = ['confetti', 'confetti', 'star', 'firework'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1,
          opacity: Math.random() * 0.8 + 0.2,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
        });
      }
    };

    const drawFirework = (x: number, y: number, size: number, opacity: number, color: string, life: number) => {
      ctx.save();
      ctx.globalAlpha = opacity * life;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Sparkles
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const x1 = x + Math.cos(angle) * size * life;
        const y1 = y + Math.sin(angle) * size * life;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x1, y1, size/4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    };

    const drawConfetti = (x: number, y: number, size: number, opacity: number, rotation: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      ctx.fillRect(-size/2, -size, size, size * 2);
      
      ctx.restore();
    };

    const drawStar = (x: number, y: number, size: number, opacity: number, rotation: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
        
        const angle2 = angle + Math.PI / 5;
        const x2 = Math.cos(angle2) * (size * 0.4);
        const y2 = Math.sin(angle2) * (size * 0.4);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'firework') {
          drawFirework(particle.x, particle.y, particle.size, particle.opacity, particle.color, particle.life);
          particle.life -= 0.01;
          if (particle.life <= 0) {
            particle.life = 1;
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
          }
        } else if (particle.type === 'confetti') {
          drawConfetti(particle.x, particle.y, particle.size, particle.opacity, particle.rotation, particle.color);
        } else {
          drawStar(particle.x, particle.y, particle.size, particle.opacity, particle.rotation, particle.color);
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > canvas.height + particle.size) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x > canvas.width + particle.size) {
          particle.x = -particle.size;
        } else if (particle.x < -particle.size) {
          particle.x = canvas.width + particle.size;
        }
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
