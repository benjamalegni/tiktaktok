import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { animate } from 'framer-motion'

type MainButtonProps = ThreeElements['group']

// Preload the model for better performance
useGLTF.preload('/models/main-button/source/model.glb')

interface MainButtonWithNavigate extends MainButtonProps {
  onNavigate?: () => void
}

export default function MainButton({ onNavigate, ...props }: MainButtonWithNavigate) {
  // Load the 3D model
  const { scene } = useGLTF('/models/main-button/source/model.glb')
  const groupRef = useRef<THREE.Group>(null)
  
  // Clone the scene once to avoid sharing the same object between instances
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  // Subscribe this component to the render-loop, rotate the model every frame
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = delta
      groupRef.current.rotation.y += delta * 1.2
    }
  })

  // Handle click with animation
  const handleClick = () => {
    if (!groupRef.current || !onNavigate) return;
    
    // Animate the scale from current to 100, then back to normal
    const initialScale = groupRef.current.scale.x;
    
    animate(initialScale, 5, {
      duration: 1,
      onUpdate: (value) => {
        if (groupRef.current) {
          groupRef.current.scale.set(value, value, value);
        }
      },
      onComplete: () => {
        // Navigate after animation completes
        onNavigate();
      },
    });
  };

  // Return the view with the 3D model
  return (
    <group
      {...props}
      ref={groupRef}
      onClick={handleClick}>
      <primitive object={clonedScene} />
    </group>
  )
}

