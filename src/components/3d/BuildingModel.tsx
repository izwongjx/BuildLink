import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';

interface BuildingModelProps {
  scrollY?: number;
  interactive?: boolean; // If false, just plays idle
}

export default function BuildingModel({ scrollY = 0, interactive = true }: BuildingModelProps) {
  const groupRef = useRef<Group>(null);
  const baseRotY = useRef(0);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const idleY = Math.sin(time * 0.4) * 0.12;
    // Base idle rotation continuous
    baseRotY.current += 0.003;
    
    let targetRotY = baseRotY.current;
    let targetRotX = 0;
    let targetScale = 1;

    if (interactive) {
      const scrollProgress = Math.min(Math.max(scrollY, 0) / 600, 1);
      targetRotY = baseRotY.current + scrollProgress * (Math.PI * 0.55);
      targetRotX = scrollProgress * (-0.1);
      targetScale = 1 + (scrollProgress * 0.08);
    }
    
    const factor = 0.04;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, factor);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, factor);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, idleY, factor);
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), factor);
  });

  return (
    <group ref={groupRef}>
      {/* Foundation */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.4} />
      </mesh>
      
      {/* 4 Wall frames (corners) */}
      <mesh position={[-1.4, -0.6, -1.4]}>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[1.4, -0.6, -1.4]}>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-1.4, -0.6, 1.4]}>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[1.4, -0.6, 1.4]}>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Roof Frame */}
      <mesh position={[-0.75, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.2, 0.1, 3.2]} />
        <meshStandardMaterial color="#2B3A4A" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.75, 0.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[2.2, 0.1, 3.2]} />
        <meshStandardMaterial color="#2B3A4A" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[0.15, 0.15, 3.2]} />
        <meshStandardMaterial color="#2B3A4A" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Floor Beams */}
      {[-0.7, 0, 0.7, 1.4].map((z, i) => (
        <mesh key={i} position={[0, -1.6, z]}>
          <boxGeometry args={[2.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}

      {/* Window Frame (front face) */}
      <group position={[0, -0.2, 1.45]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1, 0.05, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[1, 0.05, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-0.475, 0, 0]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.475, 0, 0]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* Door Frame outline base of front face */}
      <group position={[0, -1.25, 1.45]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-0.375, 0, 0]}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.375, 0, 0]}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color="#2B5CE6" emissive="#1E3A8A" emissiveIntensity={0.4} roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* Scaffolding on right side */}
      <group position={[1.6, -1.0, 0]}>
        <mesh position={[0, 0, -1]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6]} />
          <meshStandardMaterial color="#888880" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6]} />
          <meshStandardMaterial color="#888880" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 1]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6]} />
          <meshStandardMaterial color="#888880" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2]} />
          <meshStandardMaterial color="#888880" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2]} />
          <meshStandardMaterial color="#888880" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
