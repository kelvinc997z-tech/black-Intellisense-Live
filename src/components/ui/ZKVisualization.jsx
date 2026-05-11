import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, PerspectiveCamera, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const VerificationBeam = () => {
  const beamRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.scale.set(
        1 + Math.sin(t * 4) * 0.1, 
        1 + Math.sin(t * 4) * 0.1, 
        1
      );
    }
  });

  return (
    <group>
      {/* Connection Beam */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.05, 0.05, 4, 16]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.6} />
      </mesh>
      
      {/* Data Packets moving along the beam */}
      {[...Array(3)].map((_, i) => (
        <DataPacket key={i} offset={i * 1.5} />
      ))}
    </group>
  );
};

const DataPacket = ({ offset }) => {
  const packetRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = (t * 2 + offset) % 4 - 2;
    if (packetRef.current) {
      packetRef.current.position.y = pos;
    }
  });

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="#fff" />
    </mesh>
  );
};

const ZKVisualization = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        
        <group rotation={[0, 0, Math.PI / 4]}>
          {/* Bank Node */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[0.6, 32, 32]} position={[0, 2, 0]}>
              <MeshDistortMaterial color="#0066ff" speed={2} distort={0.3} emissive="#0033aa" emissiveIntensity={1} metalness={1} roughness={0} />
            </Sphere>
          </Float>

          {/* Platform Node */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[0.6, 32, 32]} position={[0, -2, 0]}>
              <MeshDistortMaterial color="#00f2ff" speed={2} distort={0.3} emissive="#00aaee" emissiveIntensity={1} metalness={1} roughness={0} />
            </Sphere>
          </Float>

          <VerificationBeam />
        </group>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ZKVisualization;
