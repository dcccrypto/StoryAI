'use client';

import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
}

export default function MatrixRain({ opacity = 0.05 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters (mix of katakana and other symbols)
    const chars = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890!@#$%^&*()';
    const charSize = 14;
    const columns = canvas.width / charSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    ctx.font = `${charSize}px monospace`;

    // Animation loop
    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = `rgba(10, 10, 10, ${1 - opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Green text
      ctx.fillStyle = '#3af23a';
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw with varying opacity for depth effect
        const x = i * charSize;
        const y = drops[i] * charSize;
        
        // Main character
        ctx.globalAlpha = 0.9;
        ctx.fillText(char, x, y);
        
        // Fainter trail
        for (let j = 1; j <= 5; j++) {
          const trailChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.globalAlpha = (0.5 - (j * 0.1));
          ctx.fillText(trailChar, x, y - (j * charSize));
        }

        // Reset drops to top with random delay
        if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    />
  );
} 