'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function FloatingRing({ radius, speed, color, tilt = 0 }: {
  radius: number; speed: number; color: string; tilt?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.z += delta * speed
  })
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.03, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

function PulsingSphere() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.04
    ref.current.scale.setScalar(s)
  })
  return (
    <Float speed={1.2} floatIntensity={0.5}>
      <Sphere ref={ref} args={[0.8, 64, 64]}>
        <MeshDistortMaterial
          color="#3b82f6"
          distort={0.3}
          speed={2.5}
          roughness={0.05}
          metalness={0.9}
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  )
}

function MiniShards() {
  const positions: [number, number, number][] = [
    [-2, 1.2, -1], [2, -0.8, -0.5], [1.5, 1.5, -1.5], [-1.8, -1, -0.8]
  ]
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b']
  const refs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (m) {
        m.rotation.x = clock.getElapsedTime() * (0.3 + i * 0.1)
        m.rotation.y = clock.getElapsedTime() * (0.2 + i * 0.15)
      }
    })
  })

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1.5 + i * 0.3} floatIntensity={1} rotationIntensity={0.5} position={pos}>
          <mesh ref={(el) => { if (el) refs.current[i] = el }}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color={colors[i]}
              emissive={colors[i]}
              emissiveIntensity={0.6}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

function MiniScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={2} color="#3b82f6" />
      <pointLight position={[-3, -2, -2]} intensity={1} color="#7c3aed" />
      <Stars radius={30} depth={20} count={500} factor={2} fade speed={0.3} />
      <PulsingSphere />
      <FloatingRing radius={1.6} speed={0.5} color="#3b82f6" tilt={0.2} />
      <FloatingRing radius={2.2} speed={-0.3} color="#7c3aed" tilt={1.0} />
      <MiniShards />
    </>
  )
}

export default function MiniCtaScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      dpr={[1, 1.5]}
    >
      <MiniScene />
    </Canvas>
  )
}
