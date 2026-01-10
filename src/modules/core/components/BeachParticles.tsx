"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'wave' | 'starfish' | 'shell' | 'bubble';
  rotation: number;
  rotationSpeed: number;
}

export function BeachParticles() {
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
      const particleCount = Math.floor(window.innerWidth / 18);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const types: ('wave' | 'starfish' | 'shell' | 'bubble')[] = ['bubble', 'bubble', 'starfish', 'shell', 'wave'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 15 + 10,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 0.6 + 0.3,
          opacity: Math.random() * 0.5 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    const drawBubble = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(173, 216, 230, 0.8)');
      gradient.addColorStop(0.7, 'rgba(135, 206, 250, 0.4)');
      gradient.addColorStop(1, 'rgba(135, 206, 250, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    };

    const drawStarfish = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ff6347';
      
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

    const drawShell = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      ctx.fillStyle = '#f4a460';
      ctx.beginPath();
      ctx.ellipse(0, 0, size/2, size/1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#d2691e';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/1.5 + (i * size/2.5));
        ctx.lineTo(size/2, -size/1.5 + (i * size/2.5));
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawWave = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity * 0.3;
      ctx.strokeStyle = '#4682b4';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.quadraticCurveTo(x - size/2, y - size/2, x, y);
      ctx.quadraticCurveTo(x + size/2, y + size/2, x + size, y);
      ctx.stroke();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'bubble') {
          drawBubble(particle.x, particle.y, particle.size, particle.opacity);
        } else if (particle.type === 'starfish') {
          drawStarfish(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else if (particle.type === 'shell') {
          drawShell(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else {
          drawWave(particle.x, particle.y, particle.size, particle.opacity);
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
