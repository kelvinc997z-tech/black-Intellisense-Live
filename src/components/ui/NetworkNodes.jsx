import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

const GlobeConnection = ({ start, end, color }) => {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.2); 
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
      <lineBasicMaterial attach="material" color={color} transparent opacity={0.3} linewidth={1} />
    </line>
  );
};

const GlobeScene = () => {
  const globeRef = useRef();
  
  const cities = [
    { name: 'LONDON', pos: [ -0.8, 1.2, 0.8 ] },
    { name: 'NEW YORK', pos: [ -1.5, 0.8, 1.2 ] },
    { name: 'SINGAPORE', pos: [ 0.8, -0.5, 1.5 ] },
    { name: 'DUBAI', pos: [ 0.2, 0.5, 1.8 ] },
    { name: 'JAKARTA', pos: [ 1.1, -0.8, 1.3 ] },
    { name: 'HONG KONG', pos: [ 1.2, 0.2, 1.4 ] },
  ].map(city => ({ ...city, vec: new THREE.Vector3(...city.pos) }));

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
      globeRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={globeRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#001a33" 
          wireframe 
          transparent 
          opacity={0.15} 
          emissive="#00f2ff" 
          emissiveIntensity={0.3} 
        />
      </Sphere>
      
      {connections.map((conn, i) => (
        <GlobeConnection key={i} start={conn[0]} end={conn[1]} color="#00f2ff" />
      ))}

      {cities.map((city, i) => (
        <group key={i} position={city.vec}>
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#00f2ff" />
          </mesh>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.15}
            color="#00f2ff"
            anchorX="center"
            outlineWidth={0.02}
            outlineColor="#000"
          >
            {city.name}
          </Text>
        </group>
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066ff" />
        
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
          <GlobeScene />
        </Float>
        
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#000a1a" transparent opacity={0.6} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default TerminalBackground;
