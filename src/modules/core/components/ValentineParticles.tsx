"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'heart' | 'rose' | 'cupid';
  rotation: number;
  rotationSpeed: number;
}

export function ValentineParticles() {
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
      const particleCount = Math.floor(window.innerWidth / 14);
      particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const types: ('heart' | 'rose' | 'cupid')[] = ['heart', 'heart', 'heart', 'rose', 'cupid'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 15 + 10,
          speedX: Math.random() * 0.8 - 0.4,
          speedY: Math.random() * 0.8 + 0.3,
          opacity: Math.random() * 0.6 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
        });
      }
    };

    const drawHeart = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      const gradient = ctx.createLinearGradient(-size, -size, size, size);
      gradient.addColorStop(0, '#ff1493');
      gradient.addColorStop(1, '#ff69b4');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, size/4);
      ctx.bezierCurveTo(-size, -size/2, -size*1.5, size/2, 0, size*1.5);
      ctx.bezierCurveTo(size*1.5, size/2, size, -size/2, 0, size/4);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawRose = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Petals
      ctx.fillStyle = '#dc143c';
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -size/2, size/3, size/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // Center
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.arc(0, 0, size/4, 0, Math.PI * 2);
      ctx.fill();
      
      // Stem
      ctx.strokeStyle = '#228b22';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, size/4);
      ctx.lineTo(0, size);
      ctx.stroke();
      
      ctx.restore();
    };

    const drawCupid = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Wings
      ctx.fillStyle = '#ffe4e1';
      ctx.beginPath();
      ctx.ellipse(x - size/3, y, size/2, size/3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + size/3, y, size/2, size/3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillStyle = '#ffb6c1';
      ctx.beginPath();
      ctx.arc(x, y, size/3, 0, Math.PI * 2);
      ctx.fill();
      
      // Bow
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - size/2, y);
      ctx.lineTo(x + size/2, y - size/4);
      ctx.stroke();
      
      // Arrow
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(x + size/2, y - size/4);
      ctx.lineTo(x + size/2 + size/6, y - size/4 - size/8);
      ctx.lineTo(x + size/2 + size/6, y - size/4 + size/8);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'heart') {
          drawHeart(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else if (particle.type === 'rose') {
          drawRose(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else {
          drawCupid(particle.x, particle.y, particle.size, particle.opacity);
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
