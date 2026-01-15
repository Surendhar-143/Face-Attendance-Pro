import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { useRef } from 'react'
import { motion } from 'framer-motion'

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 bg-[#0B1120] overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />

            <Canvas className="w-full h-full opacity-30">
                <ambientLight intensity={0.5} />
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <DottedSphere />
                </Float>
            </Canvas>
        </div>
    )
}

function DottedSphere() {
    const meshRef = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.y = t * 0.1
    })

    return (
        <Sphere args={[1, 64, 64]} ref={meshRef} scale={2}>
            <pointsMaterial color="#6366f1" size={0.02} transparent opacity={0.5} sizeAttenuation />
        </Sphere>
    )
}

export function GlowingCard({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={`glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}
