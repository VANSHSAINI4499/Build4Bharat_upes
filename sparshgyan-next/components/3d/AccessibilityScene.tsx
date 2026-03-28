'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Torus, MeshDistortMaterial, Float, Stars, Trail, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Central glowing core ─────────────────────────────────── */
function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.3
    meshRef.current.rotation.x += delta * 0.1
  })
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.35}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#4c1d95"
          emissiveIntensity={0.4}
        />
      </Sphere>
    </Float>
  )
}

/* ─── Orbiting ring ────────────────────────────────────────── */
function OrbitRing({ radius, speed, color, thickness = 0.04 }: {
  radius: number; speed: number; color: string; thickness?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.z += delta * speed
  })
  return (
    <Torus ref={ref} args={[radius, thickness, 16, 100]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0.7}
      />
    </Torus>
  )
}

/* ─── Orbiting satellite spheres ───────────────────────────── */
function OrbitingSphere({ radius, speed, phase, color }: {
  radius: number; speed: number; phase: number; color: string
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius
    ref.current.position.y = Math.sin(t * 0.5) * 0.5
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.18, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  )
}

/* ─── Floating geometric shard ─────────────────────────────── */
function FloatingShard({ position, color, scale = 1 }: {
  position: [number, number, number]; color: string; scale?: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.getElapsedTime() * 0.4
    ref.current.rotation.y = clock.getElapsedTime() * 0.6
  })
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5} position={position}>
      <mesh ref={ref} scale={scale}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.7}
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </mesh>
    </Float>
  )
}

/* ─── Particle field ───────────────────────────────────────── */
function ParticleField() {
  const count = 300
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])
  const ref = useRef<THREE.Points>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.04
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

/* ─── Wireframe icosahedron ────────────────────────────────── */
function WireFrame() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.12
    ref.current.rotation.x += delta * 0.07
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.9, 1]} />
      <meshStandardMaterial
        color="#7c3aed"
        wireframe
        transparent
        opacity={0.12}
        emissive="#7c3aed"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

/* ─── Scene composition ────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#7c3aed" />
      <pointLight position={[-5, -3, -5]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[0, 5, -3]} intensity={1} color="#06b6d4" />

      <Stars radius={80} depth={50} count={1500} factor={3} fade speed={0.5} />

      <CoreSphere />
      <WireFrame />

      <OrbitRing radius={2.5} speed={0.5} color="#7c3aed" />
      <OrbitRing radius={3.2} speed={-0.3} color="#3b82f6" thickness={0.03} />
      <OrbitRing radius={3.9} speed={0.2} color="#06b6d4" thickness={0.025} />

      <OrbitingSphere radius={2.5} speed={0.8} phase={0} color="#a78bfa" />
      <OrbitingSphere radius={2.5} speed={0.8} phase={Math.PI / 2} color="#60a5fa" />
      <OrbitingSphere radius={2.5} speed={0.8} phase={Math.PI} color="#34d399" />
      <OrbitingSphere radius={2.5} speed={0.8} phase={(Math.PI * 3) / 2} color="#22d3ee" />

      <FloatingShard position={[-3.5, 2, -2]} color="#7c3aed" scale={1.2} />
      <FloatingShard position={[3.8, -1.5, -1]} color="#3b82f6" scale={0.9} />
      <FloatingShard position={[2.5, 2.5, -3]} color="#06b6d4" />
      <FloatingShard position={[-3, -2, -2]} color="#10b981" scale={0.8} />

      <ParticleField />
    </>
  )
}

/* ─── Exported Canvas ──────────────────────────────────────── */
export default function AccessibilityScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  )
}
