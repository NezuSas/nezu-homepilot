"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'maple' | 'oak' | 'acorn';
  rotation: number;
  rotationSpeed: number;
  color: string;
}

export function AutumnParticles() {
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
      const particleCount = Math.floor(window.innerWidth / 12);
      particles = [];
      const colors = ['#ff6347', '#ff8c00', '#ffd700', '#8b4513', '#cd853f'];
      
      for (let i = 0; i < particleCount; i++) {
        const types: ('maple' | 'oak' | 'acorn')[] = ['maple', 'maple', 'oak', 'oak', 'acorn'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 15 + 10,
          speedX: Math.random() * 1.5 - 0.75,
          speedY: Math.random() * 1.2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawMapleLeaf = (x: number, y: number, size: number, opacity: number, rotation: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size/3, -size/3);
      ctx.lineTo(-size, -size/2);
      ctx.lineTo(-size/2, 0);
      ctx.lineTo(-size/1.5, size/2);
      ctx.lineTo(0, size/3);
      ctx.lineTo(size/1.5, size/2);
      ctx.lineTo(size/2, 0);
      ctx.lineTo(size, -size/2);
      ctx.lineTo(size/3, -size/3);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawOakLeaf = (x: number, y: number, size: number, opacity: number, rotation: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const x1 = Math.cos(angle) * size * 0.8;
        const y1 = Math.sin(angle) * size;
        const x2 = Math.cos(angle + Math.PI / 6) * size * 0.4;
        const y2 = Math.sin(angle + Math.PI / 6) * size * 0.6;
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawAcorn = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Cap
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(0, -size/4, size/2, Math.PI, 0);
      ctx.fill();
      
      // Body
      ctx.fillStyle = '#d2691e';
      ctx.beginPath();
      ctx.ellipse(0, size/4, size/2.5, size/1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'maple') {
          drawMapleLeaf(particle.x, particle.y, particle.size, particle.opacity, particle.rotation, particle.color);
        } else if (particle.type === 'oak') {
          drawOakLeaf(particle.x, particle.y, particle.size, particle.opacity, particle.rotation, particle.color);
        } else {
          drawAcorn(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
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
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
