import { useRef, useEffect, useState } from 'react'

interface ParallaxBackgroundProps {
  backgroundImage: string
  depthMap: string
  intensity?: number
}

export default function ParallaxBackground({ 
  backgroundImage, 
  depthMap, 
  intensity = 80 
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const farLayerRef = useRef<HTMLDivElement>(null)
  const midLayerRef = useRef<HTMLDivElement>(null)
  const nearLayerRef = useRef<HTMLDivElement>(null)
  const depthCanvasRef = useRef<HTMLCanvasElement>(null)
  const [masksReady, setMasksReady] = useState(false)
  const [maskUrls, setMaskUrls] = useState<{
    far: string | null
    mid: string | null
    near: string | null
  }>({ far: null, mid: null, near: null })

  // Load and process depth map to create multiple depth layers
  useEffect(() => {
    const depthImg = new Image()
    
    depthImg.onload = () => {
      const depthCanvas = depthCanvasRef.current
      if (!depthCanvas) return

      const depthCtx = depthCanvas.getContext('2d', { willReadFrequently: true })
      if (!depthCtx) return

      // Set canvas size
      depthCanvas.width = depthImg.width
      depthCanvas.height = depthImg.height
      
      // Draw depth map to canvas
      depthCtx.drawImage(depthImg, 0, 0)
      const depthData = depthCtx.getImageData(0, 0, depthCanvas.width, depthCanvas.height)
      
      // Create three mask canvases for different depth ranges
      const createMaskCanvas = (thresholdMin: number, thresholdMax: number): HTMLCanvasElement => {
        const canvas = document.createElement('canvas')
        canvas.width = depthCanvas.width
        canvas.height = depthCanvas.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return canvas

        const maskData = new ImageData(depthCanvas.width, depthCanvas.height)
        
        for (let i = 0; i < depthData.data.length; i += 4) {
          const depthValue = depthData.data[i] / 255 // Red channel (0-1)
          
          let maskValue = 0
          if (depthValue >= thresholdMin && depthValue <= thresholdMax) {
            // Map depth value to mask opacity
            const normalizedDepth = (depthValue - thresholdMin) / (thresholdMax - thresholdMin)
            maskValue = Math.floor(normalizedDepth * 255)
          }
          
          maskData.data[i] = maskValue     // R
          maskData.data[i + 1] = maskValue // G
          maskData.data[i + 2] = maskValue // B
          maskData.data[i + 3] = maskValue // A
        }
        
        ctx.putImageData(maskData, 0, 0)
        return canvas
      }

      // Create masks for three depth layers:
      // Far: dark areas (0-0.33)
      // Mid: medium areas (0.33-0.66)
      // Near: bright areas (0.66-1.0)
      const farMask = createMaskCanvas(0, 0.33)
      const midMask = createMaskCanvas(0.33, 0.66)
      const nearMask = createMaskCanvas(0.66, 1.0)

      // Convert to data URLs
      setMaskUrls({
        far: farMask.toDataURL(),
        mid: midMask.toDataURL(),
        near: nearMask.toDataURL()
      })
      
      setMasksReady(true)
      console.log('Depth map processed successfully', {
        width: depthCanvas.width,
        height: depthCanvas.height
      })
    }
    
    depthImg.onerror = () => {
      console.error('Failed to load depth map image:', depthMap)
    }
    
    depthImg.src = depthMap
  }, [depthMap])

  // Handle mouse movement with multi-layer parallax
  useEffect(() => {
    if (!farLayerRef.current || !midLayerRef.current || !nearLayerRef.current || !masksReady) return

    let rafId: number
    let currentX = 0
    let currentY = 0
    const smoothing = 0.15

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        if (!farLayerRef.current || !midLayerRef.current || !nearLayerRef.current) return

        // Target position (-1 to 1)
        const targetX = (e.clientX / window.innerWidth - 0.5) * 2
        const targetY = (e.clientY / window.innerHeight - 0.5) * 2

        // Smooth interpolation
        currentX += (targetX - currentX) * smoothing
        currentY += (targetY - currentY) * smoothing

        // Different movement speeds for each layer based on depth
        // Far layer (dark areas) moves least
        const farMoveX = -currentX * intensity * 0.2
        const farMoveY = -currentY * intensity * 0.2
        
        // Mid layer moves medium
        const midMoveX = -currentX * intensity * 0.7
        const midMoveY = -currentY * intensity * 0.7
        
        // Near layer (bright areas) moves most
        const nearMoveX = -currentX * intensity * 1.5
        const nearMoveY = -currentY * intensity * 1.5

        // Apply transforms
        farLayerRef.current.style.transform = 
          `translate(${farMoveX}px, ${farMoveY}px) translateZ(0)`
        midLayerRef.current.style.transform = 
          `translate(${midMoveX}px, ${midMoveY}px) translateZ(0)`
        nearLayerRef.current.style.transform = 
          `translate(${nearMoveX}px, ${nearMoveY}px) translateZ(0)`
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [masksReady, intensity])

  return (
    <>
      {/* Hidden canvas for depth map processing */}
      <canvas ref={depthCanvasRef} style={{ display: 'none' }} />
      
      <div 
        ref={containerRef}
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{
          zIndex: -1,
          pointerEvents: 'none'
        }}
      >
        {/* Far layer - dark areas (0-33% depth) - moves least */}
        {maskUrls.far && (
          <div
            ref={farLayerRef}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 'calc(100% + 500px)',
              height: 'calc(100% + 500px)',
              left: '-250px',
              top: '-250px',
              maskImage: `url(${maskUrls.far})`,
              WebkitMaskImage: `url(${maskUrls.far})`,
              maskSize: 'cover',
              WebkitMaskSize: 'cover',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        )}

        {/* Mid layer - medium areas (33-66% depth) - moves medium */}
        {maskUrls.mid && (
          <div
            ref={midLayerRef}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 'calc(100% + 500px)',
              height: 'calc(100% + 500px)',
              left: '-250px',
              top: '-250px',
              maskImage: `url(${maskUrls.mid})`,
              WebkitMaskImage: `url(${maskUrls.mid})`,
              maskSize: 'cover',
              WebkitMaskSize: 'cover',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        )}

        {/* Near layer - bright areas (66-100% depth) - moves most */}
        {maskUrls.near && (
          <div
            ref={nearLayerRef}
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 'calc(100% + 500px)',
              height: 'calc(100% + 500px)',
              left: '-250px',
              top: '-250px',
              maskImage: `url(${maskUrls.near})`,
              WebkitMaskImage: `url(${maskUrls.near})`,
              maskSize: 'cover',
              WebkitMaskSize: 'cover',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        )}

        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.25) 100%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>
    </>
  )
}
