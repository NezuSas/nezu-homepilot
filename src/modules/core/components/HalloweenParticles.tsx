"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'bat' | 'ghost' | 'pumpkin';
  rotation: number;
  rotationSpeed: number;
}

export function HalloweenParticles() {
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
        const types: ('bat' | 'ghost' | 'pumpkin')[] = ['bat', 'ghost', 'pumpkin'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 20 + 15,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 0.5 + 0.3,
          opacity: Math.random() * 0.4 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    const drawBat = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#1a1a1a';
      
      // Bat wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-size/2, -size/3, -size, 0);
      ctx.quadraticCurveTo(-size/2, size/4, 0, 0);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size/2, -size/3, size, 0);
      ctx.quadraticCurveTo(size/2, size/4, 0, 0);
      ctx.fill();
      
      // Bat body
      ctx.beginPath();
      ctx.arc(0, 0, size/4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawGhost = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#f0f0f0';
      
      // Ghost body
      ctx.beginPath();
      ctx.arc(x, y - size/3, size/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(x - size/2, y - size/3);
      ctx.lineTo(x - size/2, y + size/3);
      ctx.quadraticCurveTo(x - size/3, y + size/2, x - size/6, y + size/3);
      ctx.quadraticCurveTo(x, y + size/2, x + size/6, y + size/3);
      ctx.quadraticCurveTo(x + size/3, y + size/2, x + size/2, y + size/3);
      ctx.lineTo(x + size/2, y - size/3);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x - size/6, y - size/4, size/12, 0, Math.PI * 2);
      ctx.arc(x + size/6, y - size/4, size/12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawPumpkin = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Pumpkin body
      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.ellipse(x, y, size/2, size/2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Stem
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(x - size/12, y - size/2, size/6, size/4);
      
      // Face
      ctx.fillStyle = '#1a1a1a';
      // Eyes
      ctx.beginPath();
      ctx.moveTo(x - size/4, y - size/6);
      ctx.lineTo(x - size/6, y - size/8);
      ctx.lineTo(x - size/8, y - size/6);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(x + size/8, y - size/6);
      ctx.lineTo(x + size/6, y - size/8);
      ctx.lineTo(x + size/4, y - size/6);
      ctx.fill();
      
      // Mouth
      ctx.beginPath();
      ctx.arc(x, y + size/8, size/4, 0, Math.PI);
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'bat') {
          drawBat(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else if (particle.type === 'ghost') {
          drawGhost(particle.x, particle.y, particle.size, particle.opacity);
        } else {
          drawPumpkin(particle.x, particle.y, particle.size, particle.opacity);
        }

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        // Wrap around screen
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
