import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'

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
      // Rotate only on Y axis
      groupRef.current.rotation.y += delta * 0.6
    }
  })

  // Handle click without animation
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
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

