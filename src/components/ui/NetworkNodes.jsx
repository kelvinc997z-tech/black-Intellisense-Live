import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Node = ({ position, color, size = 0.1 }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[size, 16, 16]} position={position}>
        <MeshDistortMaterial 
          color={color} 
          speed={2} 
          distort={0.3} 
          emissive={color} 
          emissiveIntensity={2} 
        />
      </Sphere>
    </Float>
  );
};

const Connections = ({ nodes }) => {
  const lines = useMemo(() => {
    const lineGeometries = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) {
          const points = [
            new THREE.Vector3(...nodes[i]),
            new THREE.Vector3(...nodes[j]),
          ];
          lineGeometries.push(points);
        }
      }
    }
    return lineGeometries;
  }, [nodes]);

  return (
    <>
      {lines.map((points, idx) => (
        <line key={idx}>
          <bufferGeometry attach="geometry">
            <bufferAttribute 
              attach="attributes-position" 
              count={points.length * 3} 
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} 
              itemSize={3} 
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#00f2ff" transparent opacity={0.3} />
        </line>
      ))}
    </>
  );
};

const NetworkBackground = () => {
  const nodes = useMemo(() => {
    return Array.from({ length: 40 }, () => [
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
    ]);
  }, []);

  const colors = ['#00f2ff', '#0066ff', '#0033ff'];

  return (
    <div className="absolute inset-0 -z-10 bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        {/* Central Hub Core */}
        <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
          <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
            <MeshDistortMaterial 
              color="#00f2ff" 
              speed={3} 
              distort={0.4} 
              emissive="#00f2ff" 
              emissiveIntensity={3} 
            />
          </Sphere>
        </Float>
        
        <Connections nodes={nodes} />
        {nodes.map((pos, i) => (
          <Node key={i} position={pos} color={colors[i % colors.length]} />
        ))}
        
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial color="#000" side={THREE.BackSide} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default NetworkBackground;
