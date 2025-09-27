'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Animated exam question cards
function QuestionCard({ position, rotation, color, delay = 0 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime + delay) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[1.2, 0.8, 0.1]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Floating exam elements
function ExamElement({ position, type, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'question':
        return <boxGeometry args={[0.8, 0.6, 0.1]} />;
      case 'answer':
        return <sphereGeometry args={[0.3, 16, 16]} />;
      case 'timer':
        return <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />;
      case 'score':
        return <torusGeometry args={[0.4, 0.1, 8, 16]} />;
      case 'certificate':
        return <boxGeometry args={[0.6, 0.8, 0.05]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {getGeometry()}
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// Animated data flow particles
function DataParticle({ startPosition, endPosition, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const progress = (Math.sin(state.clock.elapsedTime * speed) + 1) / 2;
      meshRef.current.position.x = startPosition[0] + (endPosition[0] - startPosition[0]) * progress;
      meshRef.current.position.y = startPosition[1] + (endPosition[1] - startPosition[1]) * progress;
      meshRef.current.position.z = startPosition[2] + (endPosition[2] - startPosition[2]) * progress;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Central exam system visualization
function ExamSystem({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#4F46E5" transparent opacity={0.6} />
      </mesh>
      
      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 8, 100]} />
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.4} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[1.5, 0.03, 8, 100]} />
        <meshStandardMaterial color="#10B981" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Main 3D scene
function Scene() {
  const lightRef = useRef();
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 8;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 8;
    }
  });

  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        ref={lightRef}
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#4F46E5" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#10B981" />
      
      {/* Background with gradient */}
      <mesh position={[0, 0, -15]} scale={[30, 30, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.8} />
      </mesh>

      {/* Central exam system */}
      <ExamSystem position={[0, 0, 0]} />

      {/* Question cards floating around */}
      <QuestionCard 
        position={[-3, 2, 1]} 
        rotation={[0, Math.PI / 4, 0]} 
        color="#3B82F6" 
        delay={0}
      />
      <QuestionCard 
        position={[3, -1, 1]} 
        rotation={[0, -Math.PI / 4, 0]} 
        color="#10B981" 
        delay={1}
      />
      <QuestionCard 
        position={[-2, -2, -1]} 
        rotation={[0, Math.PI / 2, 0]} 
        color="#F59E0B" 
        delay={2}
      />

      {/* Exam elements */}
      <ExamElement position={[-4, 1, 0]} type="question" color="#3B82F6" speed={0.5} />
      <ExamElement position={[4, 0, 1]} type="answer" color="#10B981" speed={0.8} />
      <ExamElement position={[0, 3, 0]} type="timer" color="#F59E0B" speed={0.3} />
      <ExamElement position={[-3, -3, 1]} type="score" color="#8B5CF6" speed={0.6} />
      <ExamElement position={[2, 2, -1]} type="certificate" color="#EF4444" speed={0.4} />

      {/* Data flow particles */}
      <DataParticle 
        startPosition={[-5, 0, 0]} 
        endPosition={[5, 0, 0]} 
        color="#3B82F6" 
        speed={0.5}
      />
      <DataParticle 
        startPosition={[0, -5, 0]} 
        endPosition={[0, 5, 0]} 
        color="#10B981" 
        speed={0.7}
      />
      <DataParticle 
        startPosition={[-3, -3, 0]} 
        endPosition={[3, 3, 0]} 
        color="#F59E0B" 
        speed={0.4}
      />

      {/* Floating geometric shapes */}
      <mesh position={[-6, 2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.6} />
      </mesh>
      <mesh position={[6, -2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#10B981" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 4, 2]}>
        <torusGeometry args={[0.3, 0.1, 8, 16]} />
        <meshStandardMaterial color="#F59E0B" transparent opacity={0.6} />
      </mesh>

      {/* Central title with enhanced styling */}
      <Text
        position={[0, 0, 2]}
        fontSize={1.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Exam Management System
      </Text>
      
      <Text
        position={[0, -1, 2]}
        fontSize={0.4}
        color="#E2E8F0"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        Advanced 3D Learning Platform
      </Text>
    </>
  );
}

export default function Advanced3DScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        shadows
        style={{ 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)' 
        }}
      >
        <Scene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
