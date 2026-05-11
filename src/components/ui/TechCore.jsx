import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, TorusKnot, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const CoreObject = () => {
  const coreRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.5;
      ringRef.current.rotation.x = t * 0.2;
    }
  });

  return (
    <group>
      {/* Central Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <TorusKnot 
          ref={coreRef} 
          args={[1, 0.3, 128, 32]} 
          scale={1.2}
        >
          <MeshDistortMaterial 
            color="#00f2ff" 
            speed={2} 
            distort={0.4} 
            emissive="#0066ff" 
            emissiveIntensity={2} 
            roughness={0} 
            metalness={1}
          />
        </TorusKnot>
      </Float>

      {/* Outer Orbiting Ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.4} />
      </mesh>

      {/* Outer Orbiting Ring 2 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#0066ff" transparent opacity={0.3} />
      </mesh>

      {/* Particle-like glow spheres */}
      {[...Array(10)].map((_, i) => (
        <Sphere 
          key={i} 
          args={[0.05, 16, 16]} 
          position={[
            Math.sin(i * 1.2) * 3, 
            Math.cos(i * 1.2) * 3, 
            Math.sin(i * 0.5) * 3
          ]}
        >
          <meshBasicMaterial color="#00f2ff" />
        </Sphere>
      ))}
    </group>
  );
};

const TechCore = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none opacity-60">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <CoreObject />
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default TechCore;
