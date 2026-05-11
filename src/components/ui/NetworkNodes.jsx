import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const GlobeConnection = ({ start, end, color }) => {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2); // Pull the arc outwards
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute 
          attach="attributes-position" 
          count={points.length * 3} 
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} 
          itemSize={3} 
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color={color} transparent opacity={0.4} linewidth={1} />
    </line>
  );
};

const GlobeScene = () => {
  const globeRef = useRef();
  
  const { points, connections } = useMemo(() => {
    const pts = [];
    const conn = [];
    const numPoints = 40;
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      pts.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).multiplyScalar(2));
    }
    
    for (let i = 0; i < numPoints; i++) {
      const targets = [Math.floor(Math.random() * numPoints), Math.floor(Math.random() * numPoints)];
      targets.forEach(t => {
        if (i !== t) conn.push([pts[i], pts[t]]);
      });
    }
    
    return { points: pts, connections: conn };
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
      globeRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group ref={globeRef}>
      {/* The Globe Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#001a33" 
          wireframe 
          transparent 
          opacity={0.2} 
          emissive="#00f2ff" 
          emissiveIntensity={0.5} 
        />
      </Sphere>
      
      {/* The Core Glow */}
      <Sphere args={[1.9, 32, 32]}>
        <meshBasicMaterial color="#003366" transparent opacity={0.3} />
      </Sphere>

      {/* Connection Arcs */}
      {connections.map((conn, i) => (
        <GlobeConnection key={i} start={conn[0]} end={conn[1]} color="#00f2ff" />
      ))}

      {/* City Nodes */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00f2ff" />
        </mesh>
      ))}
    </group>
  );
};

const TerminalBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 bg-[#010409]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <color attach="background" args={['#010409']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <GlobeScene />
        </Float>
        
        {/* Environmental Glow */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#001a33" transparent opacity={0.4} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default TerminalBackground;
