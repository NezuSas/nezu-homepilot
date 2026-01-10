"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'snowflake' | 'star' | 'gift';
  rotation: number;
  rotationSpeed: number;
}

export function SnowParticles() {
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
      for (let i = 0; i < particleCount; i++) {
        const types: ('snowflake' | 'star' | 'gift')[] = ['snowflake', 'snowflake', 'snowflake', 'star', 'gift'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 15 + 8,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.3,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
        });
      }
    };

    const drawSnowflake = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      // Draw 6 branches
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 6);
        
        // Main branch
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
        ctx.stroke();
        
        // Side branches
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.6);
        ctx.lineTo(-size * 0.3, -size * 0.8);
        ctx.moveTo(0, -size * 0.6);
        ctx.lineTo(size * 0.3, -size * 0.8);
        ctx.stroke();
        
        ctx.restore();
      }
      
      // Center circle
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawStar = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#fffacd');
      gradient.addColorStop(0.5, '#ffd700');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      
      ctx.fillStyle = gradient;
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

    const drawGift = (x: number, y: number, size: number, opacity: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Gift box
      ctx.fillStyle = '#c41e3a';
      ctx.fillRect(-size/2, -size/2, size, size);
      
      // Ribbon vertical
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-size/8, -size/2, size/4, size);
      
      // Ribbon horizontal
      ctx.fillRect(-size/2, -size/8, size, size/4);
      
      // Bow
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(-size/4, -size/2, size/5, 0, Math.PI * 2);
      ctx.arc(size/4, -size/2, size/5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        if (particle.type === 'snowflake') {
          drawSnowflake(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else if (particle.type === 'star') {
          drawStar(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        } else {
          drawGift(particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
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
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
