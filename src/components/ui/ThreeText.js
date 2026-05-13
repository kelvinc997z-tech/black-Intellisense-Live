import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const EvolvedText = () => {
  const textRef = useRef();
  const [currentText, setCurrentText] = useState('INTELLITRADE');
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (textRef.current) {
      // High-frequency movement for that "tech" feel
      textRef.current.rotation.y = THREE.MathUtils.lerp(
        textRef.current.rotation.y, 
        (state.mouse.x * 0.3) + Math.sin(t * 0.8) * 0.15, 
        0.1
      );
      textRef.current.rotation.x = THREE.MathUtils.lerp(
        textRef.current.rotation.x, 
        (state.mouse.y * -0.3), 
        0.1
      );
    }
  });

  // Cycle text every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText(prev => prev === 'INTELLITRADE' ? 'SENSE50' : 'INTELLITRADE');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={0.8}>
      <Text
        ref={textRef}
        fontSize={1}
        color="#22d3ee"
        font="https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zR6hxS9CQfP26.woff"
        anchorX="center"
        anchorY="middle"
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.05}
      >
        {currentText}
        <MeshDistortMaterial 
          color="#22d3ee" 
          speed={3} 
          distort={0.2} 
          radius={1} 
          emissive="#06b6d4" 
          emissiveIntensity={1.5}
          metalness={1}
          roughness={0}
        />
      </Text>
    </Float>
  );
};

const ThreeText = () => {
  return (
    <div className="w-full h-full min-h-[200px] relative">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
        <EvolvedText />
      </Canvas>
    </div>
  );
};

export default ThreeText;
