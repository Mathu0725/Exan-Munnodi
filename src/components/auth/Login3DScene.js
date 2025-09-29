'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  Box,
  Sphere,
  Torus,
  Cylinder,
} from '@react-three/drei';
import * as THREE from 'three';

// Floating geometric shapes representing exam concepts
function FloatingShape({ position, color, shape, speed = 1 }) {
  const meshRef = useRef();

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 100]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [shape]);

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// Animated exam-related icons
function ExamIcon({ position, type, color }) {
  const meshRef = useRef();

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const getIconGeometry = () => {
    switch (type) {
      case 'document':
        return <boxGeometry args={[0.8, 1.2, 0.1]} />;
      case 'pencil':
        return <cylinderGeometry args={[0.05, 0.05, 1, 8]} />;
      case 'calculator':
        return <boxGeometry args={[0.6, 0.4, 0.1]} />;
      case 'book':
        return <boxGeometry args={[0.5, 0.7, 0.3]} />;
      case 'laptop':
        return <boxGeometry args={[1, 0.6, 0.1]} />;
      case 'chart':
        return <boxGeometry args={[0.8, 0.6, 0.1]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {getIconGeometry()}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating particles
function Particle({ position, color }) {
  const meshRef = useRef();

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// Main 3D scene
function Scene() {
  const lightRef = useRef();

  useFrame(state => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 5;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={lightRef}
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color='#4F46E5' />

      {/* Background gradient */}
      <mesh position={[0, 0, -10]} scale={[20, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial color='#1E1B4B' transparent opacity={0.1} />
      </mesh>

      {/* Floating shapes representing different exam concepts */}
      <FloatingShape
        position={[-3, 2, 0]}
        color='#3B82F6'
        shape='box'
        speed={0.5}
      />
      <FloatingShape
        position={[3, -1, 1]}
        color='#10B981'
        shape='sphere'
        speed={0.8}
      />
      <FloatingShape
        position={[-2, -2, -1]}
        color='#F59E0B'
        shape='torus'
        speed={0.3}
      />
      <FloatingShape
        position={[2, 3, 0]}
        color='#EF4444'
        shape='cylinder'
        speed={0.6}
      />
      <FloatingShape
        position={[0, 1, 2]}
        color='#8B5CF6'
        shape='box'
        speed={0.4}
      />

      {/* Exam-related icons */}
      <ExamIcon position={[-4, 0, 0]} type='document' color='#3B82F6' />
      <ExamIcon position={[4, 1, 0]} type='pencil' color='#10B981' />
      <ExamIcon position={[0, -3, 1]} type='calculator' color='#F59E0B' />
      <ExamIcon position={[-2, 3, -1]} type='book' color='#8B5CF6' />
      <ExamIcon position={[3, -2, -1]} type='laptop' color='#06B6D4' />
      <ExamIcon position={[-3, -1, 1]} type='chart' color='#F97316' />

      {/* Floating particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <Particle
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 5,
          ]}
          color={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5]}
        />
      ))}

      {/* Central title text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
        color='#FFFFFF'
        anchorX='center'
        anchorY='middle'
        font='/fonts/inter-bold.woff'
      >
        Exam Management System
      </Text>
    </>
  );
}

export default function Login3DScene() {
  return (
    <div className='w-full h-full'>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        shadows
        style={{
          background:
            'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%)',
        }}
      >
        <Scene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
