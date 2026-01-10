"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'sakura' | 'butterfly' | 'flower';
  rotation: number;
  rotationSpeed: number;
}

export function SakuraParticles() {
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
      const particleCount = Math.floor(window.innerWidth / 15);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const types: ('sakura' | 'butterfly' | 'flower')[] = ['sakura', 'sakura', 'sakura', 'butterfly', 'flower'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 12 + 8,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 0.8 + 0.4,
          opacity: Math.random() * 0.6 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
        });
      }
    };

    const drawSakura = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Draw 5 petals
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 5);
        
        // Petal
        ctx.fillStyle = '#ffb7d5';
        ctx.beginPath();
        ctx.ellipse(0, -size/2, size/3, size/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
      
      // Center
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, size/5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawButterfly = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Left wing
      ctx.fillStyle = '#ff69b4';
      ctx.beginPath();
      ctx.ellipse(-size/3, 0, size/2, size/1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Right wing
      ctx.beginPath();
      ctx.ellipse(size/3, 0, size/2, size/1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-size/12, -size/2, size/6, size);
      
      ctx.restore();
    };

    const drawFlower = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Petals
      ctx.fillStyle = '#ffb3e6';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.PI * 2 * i) / 6);
        ctx.beginPath();
        ctx.arc(0, -size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Center
      ctx.fillStyle = '#ffff99';
      ctx.beginPath();
      ctx.arc(x, y, size/4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'sakura') {
          drawSakura(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else if (particle.type === 'butterfly') {
          drawButterfly(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else {
          drawFlower(particle.x, particle.y, particle.size, particle.opacity);
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
