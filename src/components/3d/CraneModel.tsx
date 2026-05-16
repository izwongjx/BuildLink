import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';

export default function CraneModel() {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const idleY = (Math.sin(time * 0.5) * 0.1) - 2.5; // Offset by -2.5 to bring it lower
    groupRef.current.rotation.y += 0.003;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, idleY, 0.05);
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]} position={[0, -2, 0]}>
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[2.5, 0.3, 2.5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, -1.7, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 0.6, 8]} />
        <meshStandardMaterial color="#E8642A" />
      </mesh>

      {/* Tower Mast */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.8, 5, 0.8]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Decorative lattice indentations using wireframe outer box */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.85, 4.8, 0.85]} />
        <meshStandardMaterial color="#222222" wireframe />
      </mesh>

      {/* Cab & Operator section */}
      <mesh position={[0, 3.8, 0.8]}>
        <boxGeometry args={[1.0, 1.0, 1.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 3.8, 1.4]}>
        <boxGeometry args={[0.8, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" emissive="#1E3A8A" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Jib (Main Arm forward) */}
      <mesh position={[0, 4.4, 3.5]}>
        <boxGeometry args={[0.6, 0.6, 7]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 4.4, 3.5]}>
        <boxGeometry args={[0.62, 0.62, 6.8]} />
        <meshStandardMaterial color="#222222" wireframe />
      </mesh>

      {/* Counter-Jib (Back Arm) */}
      <mesh position={[0, 4.4, -1.8]}>
        <boxGeometry args={[0.6, 0.6, 3.6]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Concrete Counterweights */}
      <mesh position={[0, 4.4, -3.0]}>
        <boxGeometry args={[1.4, 1.0, 0.8]} />
        <meshStandardMaterial color="#E4E2DC" roughness={0.9} />
      </mesh>

      {/* Apex (Top Tower point) */}
      <mesh position={[0, 5.6, 0]}>
        <cylinderGeometry args={[0.1, 0.4, 1.8, 4]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>

      {/* Tension Cables */}
      <mesh position={[0, 5.0, 2.0]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 4.5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 5.0, -1.4]} rotation={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Hoist cable dropping down */}
      <mesh position={[0, 1.0, 6.0]}>
        <cylinderGeometry args={[0.02, 0.02, 6.5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      {/* Hook block */}
      <mesh position={[0, -2.5, 6.0]}>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color="#E8642A" />
      </mesh>
    </group>
  );
}
