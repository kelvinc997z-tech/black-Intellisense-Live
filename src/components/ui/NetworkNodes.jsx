import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, PerspectiveCamera, Text, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const ConnectionArc = ({ start, end, color }) => {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.5); 
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
      <lineBasicMaterial 
        attach="material" 
        color={color} 
        transparent 
        opacity={0.2} 
        linewidth={1} 
      />
    </line>
  );
};

const DigitalGlobe = () => {
  const globeRef = useRef();
  
  const cities = [
    { name: 'LONDON', pos: [ -0.8, 1.2, 0.8 ] },
    { name: 'NEW YORK', pos: [ -1.5, 0.8, 1.2 ] },
    { name: 'SINGAPORE', pos: [ 0.8, -0.5, 1.5 ] },
    { name: 'DUBAI', pos: [ 0.2, 0.5, 1.8 ] },
    { name: 'JAKARTA', pos: [ 1.1, -0.8, 1.3 ] },
    { name: 'HONG KONG', pos: [ 1.2, 0.2, 1.4 ] },
    { name: 'TOKYO', pos: [ 1.3, 0.5, 1.1 ] },
  ].map(city => ({ ...city, vec: new THREE.Vector3(...city.pos) }));

  const { dotPositions, connections } = useMemo(() => {
    const pts = [];
    const conn = [];
    const numDots = 1500; // High density for "digital" look
    
    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(-1 + (2 * i) / numDots);
      const theta = Math.sqrt(numDots * Math.PI) * phi;
      pts.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).multiplyScalar(2));
    }
    
    // Only a few random connections to avoid clutter
    for (let i = 0; i < 30; i++) {
      const start = pts[Math.floor(Math.random() * numDots)];
      const end = pts[Math.floor(Math.random() * numDots)];
      conn.push([start, end]);
    }
    
    return { dotPositions: pts, connections: conn };
  }, []);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Point Cloud Globe */}
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute 
            attach="attributes-position" 
            count={dotPositions.length * 3} 
            array={new Float32Array(dotPositions.flatMap(p => [p.x, p.y, p.z]))} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          attach="material" 
          color="#00f2ff" 
          size={0.015} 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Outer Glow Shell */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial 
          color="#00f2ff" 
          transparent 
          opacity={0.03} 
          side={THREE.BackSide} 
        />
      </Sphere>

      {/* Connections */}
      {connections.map((conn, i) => (
        <ConnectionArc key={i} start={conn[0]} end={conn[1]} color="#00f2ff" />
      ))}

      {/* Major Hubs */}
      {cities.map((city, i) => (
        <group key={i} position={city.vec}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.12}
            color="#fff"
            anchorX="center"
            outlineWidth={0.01}
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
        <PerspectiveCamera makeDefault position={[0, 0, 7]} />
        <color attach="background" args={['#010409']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#0066ff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
          <DigitalGlobe />
        </Float>

        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 0.75}
        />
        
        <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#000a1a" transparent opacity={0.6} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default TerminalBackground;
