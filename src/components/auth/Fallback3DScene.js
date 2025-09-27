'use client';

import { useEffect, useRef } from 'react';

export default function Fallback3DScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating exam-related shapes
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Floating exam documents (rectangles)
      for (let i = 0; i < 6; i++) {
        const angle = (time * 0.3 + i * Math.PI / 3) % (Math.PI * 2);
        const radius = 120 + Math.sin(time * 0.7 + i) * 60;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius + Math.sin(time * 1.5 + i) * 40;
        
        const width = 40 + Math.sin(time * 0.8 + i) * 20;
        const height = 30 + Math.sin(time * 0.6 + i) * 15;
        const opacity = 0.2 + Math.sin(time * 0.6 + i) * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.1 + i);
        ctx.fillStyle = `rgba(${60 + i * 40}, ${100 + i * 30}, ${200 + i * 20}, ${opacity})`;
        ctx.fillRect(-width/2, -height/2, width, height);
        ctx.restore();
      }

      // Floating pencils (lines)
      for (let i = 0; i < 8; i++) {
        const angle = (time * 0.4 + i * Math.PI / 4) % (Math.PI * 2);
        const radius = 80 + Math.sin(time * 0.5 + i) * 40;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius + Math.sin(time * 1.2 + i) * 25;
        
        const length = 30 + Math.sin(time * 0.7 + i) * 15;
        const opacity = 0.3 + Math.sin(time * 0.8 + i) * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(x - length/2, y);
        ctx.lineTo(x + length/2, y);
        ctx.strokeStyle = `rgba(${200 + i * 10}, ${100 + i * 20}, ${50 + i * 15}, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Floating calculators (squares with buttons)
      for (let i = 0; i < 4; i++) {
        const angle = (time * 0.2 + i * Math.PI / 2) % (Math.PI * 2);
        const radius = 180 + Math.sin(time * 0.6 + i) * 100;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius + Math.sin(time * 1.3 + i) * 50;
        
        const size = 35 + Math.sin(time * 0.9 + i) * 20;
        const opacity = 0.15 + Math.sin(time * 0.7 + i) * 0.25;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.05 + i);
        ctx.fillStyle = `rgba(${150 + i * 25}, ${80 + i * 30}, ${120 + i * 25}, ${opacity})`;
        ctx.fillRect(-size/2, -size/2, size, size);
        
        // Draw calculator buttons
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            ctx.fillRect(-size/2 + 5 + j * 8, -size/2 + 5 + k * 8, 6, 6);
          }
        }
        ctx.restore();
      }

      // Floating data connections (representing exam data flow)
      for (let i = 0; i < 6; i++) {
        const startAngle = (time * 0.15 + i * Math.PI / 3) % (Math.PI * 2);
        const endAngle = startAngle + Math.PI / 6;
        const radius = 220 + Math.sin(time * 0.3 + i) * 120;
        
        const startX = centerX + Math.cos(startAngle) * radius;
        const startY = centerY + Math.sin(startAngle) * radius;
        const endX = centerX + Math.cos(endAngle) * radius;
        const endY = centerY + Math.sin(endAngle) * radius;
        
        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(${60 + i * 30}, ${120 + i * 20}, ${200 + i * 15}, ${0.1 + Math.sin(time + i) * 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw data points along the line
        for (let j = 0; j < 3; j++) {
          const t = j / 3;
          const x = startX + (endX - startX) * t;
          const y = startY + (endY - startY) * t;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${100 + i * 20}, ${150 + i * 15}, ${255}, ${0.3 + Math.sin(time * 2 + i + j) * 0.2})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)'
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white/80">
          <h1 className="text-4xl font-bold mb-4">Exam Management System</h1>
          <p className="text-lg">Advanced 3D Learning Platform</p>
        </div>
      </div>
    </div>
  );
}
