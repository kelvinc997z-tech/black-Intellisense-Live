import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const EvolvedText = () => {
  const textRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (textRef.current) {
      // Gentle rotation based on mouse and time
      textRef.current.rotation.y = THREE.MathUtils.lerp(
        textRef.current.rotation.y, 
        (state.mouse.x * 0.2) + Math.sin(t * 0.5) * 0.1, 
        0.1
      );
      textRef.current.rotation.x = THREE.MathUtils.lerp(
        textRef.current.rotation.x, 
        (state.mouse.y * -0.2), 
        0.1
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        ref={textRef}
        fontSize={1}
        color="#22d3ee"
        font="https://fonts.gstatic.com/s/raleway/v28/1Ptxg8zR6hxS9CQfP26.woff" // Using a hosted font
        anchorX="center"
        anchorY="middle"
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
      >
        EVOLVED.
        <MeshDistortMaterial 
          color="#22d3ee" 
          speed={2} 
          distort={0.1} 
          radius={1} 
          emissive="#06b6d4" 
          emissiveIntensity={0.5}
        />
      </Text>
    </Float>
  );
};

const ThreeText = () => {
  return (
    <div className="w-full h-full min-h-[200px] relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <EvolvedText />
      </Canvas>
    </div>
  );
};

export default ThreeText;
