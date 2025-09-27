'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Simple floating cube
function FloatingCube({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// Simple floating sphere
function FloatingSphere({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// Simple floating cylinder
function FloatingCylinder({ position, color, speed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Main 3D scene
function Scene() {
  const lightRef = useRef();
  
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 5;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 5;
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
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#4F46E5" />
      
      {/* Background */}
      <mesh position={[0, 0, -10]} scale={[20, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#1E1B4B" transparent opacity={0.1} />
      </mesh>

      {/* Floating shapes */}
      <FloatingCube position={[-3, 2, 0]} color="#3B82F6" speed={0.5} />
      <FloatingSphere position={[3, -1, 1]} color="#10B981" speed={0.8} />
      <FloatingCylinder position={[-2, -2, -1]} color="#F59E0B" speed={0.3} />
      <FloatingCube position={[2, 3, 0]} color="#EF4444" speed={0.6} />
      <FloatingSphere position={[0, 1, 2]} color="#8B5CF6" speed={0.4} />
      <FloatingCylinder position={[-4, 0, 0]} color="#06B6D4" speed={0.7} />
      <FloatingCube position={[4, 1, 0]} color="#F97316" speed={0.2} />
    </>
  );
}

export default function Simple3DScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
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
