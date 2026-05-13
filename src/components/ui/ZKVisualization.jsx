import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, PerspectiveCamera, OrbitControls, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

const HyperTunnel = () => {
  const tunnelRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (tunnelRef.current) {
      tunnelRef.current.position.z = (t * 2) % 10;
    }
  });

  return (
    <group ref={tunnelRef}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 2]}>
          <torusGeometry args={[4, 0.01, 16, 100]} />
          <meshBasicMaterial color="#00f2ff" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
};

const ParticleField = () => {
  const count = 400;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) p[i] = (Math.random() - 0.5) * 30;
    return p;
  }, []);

  const particlesRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.05;
    particlesRef.current.rotation.x = t * 0.02;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={points} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00f2ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
};

const SecurityRing = ({ radius, speed, color, thickness = 0.02 }) => {
  const ringRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z += speed;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.5;
    }
  });
  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
};

const VerificationBeam = () => {
  const beamRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.scale.set(
        1 + Math.sin(t * 8) * 0.2, 
        1 + Math.sin(t * 8) * 0.2, 
        1
      );
    }
  });

  return (
    <group>
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.03, 0.03, 4, 16]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.8} />
      </mesh>
      
      {[...Array(8)].map((_, i) => (
        <DataPacket key={i} offset={i * 0.5} />
      ))}
    </group>
  );
};

const DataPacket = ({ offset }) => {
  const packetRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = (t * 4 + offset) % 4 - 2;
    if (packetRef.current) {
      packetRef.current.position.y = pos;
      packetRef.current.scale.setScalar(Math.sin(t * 5 + offset) * 0.1 + 1);
    }
  });

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshBasicMaterial color="#fff" />
    </mesh>
  );
};

const ZKVisualization = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8] }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        
        <Environment preset="city" />
        <ParticleField />
        <HyperTunnel />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={2} />
        
        <group rotation={[0, 0, Math.PI / 4]}>
          {/* Bank Node */}
          <Float speed={3} rotationIntensity={1} floatIntensity={1}>
            <group position={[0, 2, 0]}>
              <Sphere args={[0.6, 64, 64]}>
                <MeshDistortMaterial 
                  color="#0066ff" 
                  speed={4} 
                  distort={0.4} 
                  emissive="#0033aa" 
                  emissiveIntensity={2} 
                  metalness={1} 
                  roughness={0} 
                />
              </Sphere>
              <SecurityRing radius={0.8} speed={0.02} color="#0066ff" />
              <SecurityRing radius={1.1} speed={-0.01} color="#00f2ff" thickness={0.01} />
              <SecurityRing radius={1.4} speed={0.005} color="#0033aa" thickness={0.005} />
            </group>
          </Float>

          {/* Platform Node */}
          <Float speed={3} rotationIntensity={1} floatIntensity={1}>
            <group position={[0, -2, 0]}>
              <Sphere args={[0.6, 64, 64]}>
                <MeshDistortMaterial 
                  color="#00f2ff" 
                  speed={4} 
                  distort={0.4} 
                  emissive="#00aaee" 
                  emissiveIntensity={2} 
                  metalness={1} 
                  roughness={0} 
                />
              </Sphere>
              <SecurityRing radius={0.8} speed={-0.02} color="#00f2ff" />
              <SecurityRing radius={1.1} speed={0.01} color="#0066ff" thickness={0.01} />
              <SecurityRing radius={1.4} speed={-0.005} color="#00aaee" thickness={0.005} />
            </group>
          </Float>

          <VerificationBeam />
        </group>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ZKVisualization;
