'use client';

import { useEffect, useRef } from 'react';

export default function CSS3DScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating exam elements
    const createFloatingElement = (type, delay = 0) => {
      const element = document.createElement('div');
      element.className = `floating-${type}`;
      element.style.animationDelay = `${delay}s`;
      container.appendChild(element);
    };

    // Create exam documents
    for (let i = 0; i < 6; i++) {
      createFloatingElement('document', i * 0.5);
    }

    // Create pencils
    for (let i = 0; i < 4; i++) {
      createFloatingElement('pencil', i * 0.7);
    }

    // Create calculators
    for (let i = 0; i < 3; i++) {
      createFloatingElement('calculator', i * 0.9);
    }

    // Create books
    for (let i = 0; i < 4; i++) {
      createFloatingElement('book', i * 0.6);
    }

    // Create laptops
    for (let i = 0; i < 2; i++) {
      createFloatingElement('laptop', i * 1.2);
    }

    // Create charts
    for (let i = 0; i < 3; i++) {
      createFloatingElement('chart', i * 0.8);
    }

    return () => {
      // Cleanup
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className='w-full h-full relative overflow-hidden'>
      <style jsx>{`
        .floating-document {
          position: absolute;
          width: 60px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
          animation: floatDocument 8s ease-in-out infinite;
          opacity: 0.8;
        }

        .floating-pencil {
          position: absolute;
          width: 4px;
          height: 40px;
          background: linear-gradient(45deg, #ef4444, #dc2626);
          border-radius: 2px;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
          animation: floatPencil 6s ease-in-out infinite;
          opacity: 0.7;
        }

        .floating-calculator {
          position: absolute;
          width: 50px;
          height: 70px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          animation: floatCalculator 7s ease-in-out infinite;
          opacity: 0.8;
        }

        .floating-book {
          position: absolute;
          width: 45px;
          height: 60px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-radius: 4px;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
          animation: floatBook 9s ease-in-out infinite;
          opacity: 0.8;
        }

        .floating-laptop {
          position: absolute;
          width: 70px;
          height: 50px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
          animation: floatLaptop 10s ease-in-out infinite;
          opacity: 0.8;
        }

        .floating-chart {
          position: absolute;
          width: 55px;
          height: 45px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
          animation: floatChart 8s ease-in-out infinite;
          opacity: 0.8;
        }

        @keyframes floatDocument {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) rotate(-3deg);
          }
          75% {
            transform: translateY(-20px) rotate(3deg);
          }
        }

        @keyframes floatPencil {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @keyframes floatCalculator {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-25px) rotate(2deg);
          }
          66% {
            transform: translateY(-35px) rotate(-2deg);
          }
        }

        @keyframes floatBook {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(3deg);
          }
          50% {
            transform: translateY(-30px) rotate(-2deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        @keyframes floatLaptop {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(1deg);
          }
        }

        @keyframes floatChart {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(2deg);
          }
          66% {
            transform: translateY(-35px) rotate(-1deg);
          }
        }

        .floating-document:nth-child(1) {
          top: 10%;
          left: 10%;
        }
        .floating-document:nth-child(2) {
          top: 20%;
          left: 80%;
        }
        .floating-document:nth-child(3) {
          top: 60%;
          left: 15%;
        }
        .floating-document:nth-child(4) {
          top: 70%;
          left: 85%;
        }
        .floating-document:nth-child(5) {
          top: 40%;
          left: 5%;
        }
        .floating-document:nth-child(6) {
          top: 80%;
          left: 70%;
        }

        .floating-pencil:nth-child(7) {
          top: 15%;
          left: 20%;
        }
        .floating-pencil:nth-child(8) {
          top: 25%;
          left: 75%;
        }
        .floating-pencil:nth-child(9) {
          top: 65%;
          left: 25%;
        }
        .floating-pencil:nth-child(10) {
          top: 75%;
          left: 80%;
        }

        .floating-calculator:nth-child(11) {
          top: 30%;
          left: 30%;
        }
        .floating-calculator:nth-child(12) {
          top: 50%;
          left: 60%;
        }
        .floating-calculator:nth-child(13) {
          top: 80%;
          left: 40%;
        }

        .floating-book:nth-child(14) {
          top: 35%;
          left: 10%;
        }
        .floating-book:nth-child(15) {
          top: 45%;
          left: 90%;
        }
        .floating-book:nth-child(16) {
          top: 75%;
          left: 20%;
        }
        .floating-book:nth-child(17) {
          top: 85%;
          left: 80%;
        }

        .floating-laptop:nth-child(18) {
          top: 20%;
          left: 50%;
        }
        .floating-laptop:nth-child(19) {
          top: 60%;
          left: 50%;
        }

        .floating-chart:nth-child(20) {
          top: 10%;
          left: 60%;
        }
        .floating-chart:nth-child(21) {
          top: 40%;
          left: 80%;
        }
        .floating-chart:nth-child(22) {
          top: 70%;
          left: 60%;
        }
      `}</style>

      <div
        ref={containerRef}
        className='w-full h-full'
        style={{
          background:
            'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)',
        }}
      />

      {/* Central title */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'>
        <div className='text-center text-white/90'>
          <h1 className='text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
            Exam Management System
          </h1>
          <p className='text-lg md:text-xl text-white/70'>
            Advanced 3D Learning Platform
          </p>
        </div>
      </div>
    </div>
  );
}
