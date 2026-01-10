"use client";

import * as React from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function AnimatedBackgroundComponent() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const animationFrameRef = React.useRef<number | undefined>(undefined);
  const [isMounted, setIsMounted] = React.useState(false);
  const [wallpaper, setWallpaper] = React.useState<{ type: 'default' | 'preset' | 'custom', value: string }>({ type: 'default', value: '' });

  React.useEffect(() => {
    setIsMounted(true);
    
    // Load user wallpaper preference
    const loadWallpaper = async () => {
      try {
        // Check if user is authenticated before making API call
        const token = localStorage.getItem('token');
        if (!token) {
          // User not logged in, use default wallpaper
          return;
        }

        const { authService } = await import("../../auth/services/authService");
        const { PREDEFINED_WALLPAPERS } = await import("../constants/wallpapers");
        
        const user = await authService.me();
        
        if (user.wallpaper) {
          // Check if it's a predefined wallpaper
          const preset = PREDEFINED_WALLPAPERS.find(w => w.id === user.wallpaper);
          
          if (preset) {
            if (preset.id === 'default') {
              setWallpaper({ type: 'default', value: '' });
            } else {
              setWallpaper({ type: 'preset', value: preset.css });
            }
          } else if (user.wallpaper.startsWith('/media/')) {
            // It's a custom uploaded image
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            setWallpaper({ type: 'custom', value: `${backendUrl}${user.wallpaper}` });
          }
        }
      } catch (error: any) {
        // Silently handle errors - just use default wallpaper
        console.debug("Could not load wallpaper, using default");
      }
    };
    
    loadWallpaper();
  }, []);

  // Effect for particle animation (only for default wallpaper)
  React.useEffect(() => {
    if (!isMounted || wallpaper.type !== 'default') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.4,
    }));

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check if dark mode
      const isDark = document.documentElement.classList.contains("dark");
      const particleColor = isDark ? "147, 197, 253" : "59, 130, 246"; // blue-300 / blue-500

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / 120) * 0.3;
            ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMounted, wallpaper.type]);

  if (wallpaper.type === 'custom') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url(${wallpaper.value})` }}
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px]" />
      </div>
    );
  }

  if (wallpaper.type === 'preset') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${wallpaper.value} transition-all duration-500`} />
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />
      </div>
    );
  }

  // Default particle animation
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/50 dark:to-purple-950/50" />
      
      {/* Animated gradient blobs - MUCH more visible */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 dark:opacity-20 animate-blob" />
      
      <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400 to-blue-400 dark:from-cyan-500 dark:to-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 dark:opacity-20 animate-blob-slow" />
      
      <div className="absolute -bottom-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 dark:opacity-20 animate-blob-slower" />
      
      <div className="absolute bottom-0 right-20 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400 to-teal-400 dark:from-emerald-500 dark:to-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 dark:opacity-20 animate-blob" />
      
      {/* Particle canvas */}
      {isMounted && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}
      
      {/* Grid overlay - more visible */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

export const AnimatedBackground = React.memo(AnimatedBackgroundComponent);
