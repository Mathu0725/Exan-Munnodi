'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Floating exam documents
function ExamDocument({ position, rotation, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * speed) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[1.2, 0.8, 0.1]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Floating pencils
function ExamPencil({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating calculators
function Calculator({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.6, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating books
function Book({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.6, 0.8, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating laptops
function Laptop({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.6) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1.2, 0.8, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating charts/graphs
function Chart({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.35;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.6, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Floating particles representing data flow
function DataParticle({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed) * 2;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed) * 1.5;
      meshRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// Central exam system hub
function ExamHub({ position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Central sphere */}
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
      />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#4F46E5" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#10B981" />
      
      {/* Background */}
      <mesh position={[0, 0, -15]} scale={[30, 30, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.8} />
      </mesh>

      {/* Central exam hub */}
      <ExamHub position={[0, 0, 0]} />

      {/* Exam documents floating around */}
      <ExamDocument 
        position={[-4, 2, 1]} 
        rotation={[0, Math.PI / 4, 0]} 
        color="#3B82F6" 
        speed={0.5}
      />
      <ExamDocument 
        position={[4, -1, 1]} 
        rotation={[0, -Math.PI / 4, 0]} 
        color="#10B981" 
        speed={0.8}
      />
      <ExamDocument 
        position={[-2, -3, -1]} 
        rotation={[0, Math.PI / 2, 0]} 
        color="#F59E0B" 
        speed={0.3}
      />

      {/* Exam tools */}
      <ExamPencil position={[-5, 1, 0]} color="#EF4444" speed={0.6} />
      <ExamPencil position={[5, -2, 1]} color="#8B5CF6" speed={0.4} />
      
      <Calculator position={[0, 3, 0]} color="#F59E0B" speed={0.5} />
      <Calculator position={[-3, -2, 1]} color="#06B6D4" speed={0.7} />
      
      <Book position={[3, 2, -1]} color="#8B5CF6" speed={0.3} />
      <Book position={[-2, 3, 1]} color="#F97316" speed={0.6} />
      
      <Laptop position={[2, -3, 0]} color="#10B981" speed={0.4} />
      <Laptop position={[-4, -1, -1]} color="#3B82F6" speed={0.8} />
      
      <Chart position={[1, 4, 0]} color="#F59E0B" speed={0.5} />
      <Chart position={[-1, -4, 1]} color="#EF4444" speed={0.7} />

      {/* Data flow particles */}
      <DataParticle position={[-6, 0, 0]} color="#3B82F6" speed={0.5} />
      <DataParticle position={[6, 0, 0]} color="#10B981" speed={0.7} />
      <DataParticle position={[0, -6, 0]} color="#F59E0B" speed={0.4} />
      <DataParticle position={[0, 6, 0]} color="#8B5CF6" speed={0.6} />
      <DataParticle position={[-3, -3, 0]} color="#EF4444" speed={0.3} />
      <DataParticle position={[3, 3, 0]} color="#06B6D4" speed={0.8} />

      {/* Floating geometric shapes for visual appeal */}
      <mesh position={[-7, 3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#3B82F6" transparent opacity={0.6} />
      </mesh>
      <mesh position={[7, -3, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#10B981" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 5, 2]}>
        <torusGeometry args={[0.3, 0.1, 8, 16]} />
        <meshStandardMaterial color="#F59E0B" transparent opacity={0.6} />
      </mesh>
    </>
  );
}

export default function Exam3DScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        shadows
        style={{ 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #334155 50%, #1E293B 75%, #0F172A 100%)' 
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
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
