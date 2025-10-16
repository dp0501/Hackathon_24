import React, { useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 1. ✨ ADVANCED: Interactive Particle System Component
function InteractiveParticles() {
  const groupRef = useRef(null);
  const particlesRef = useRef(null);
  const { viewport, mouse } = useThree();

  const count = 7000;

  // Generate initial particle data
  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 40;

      velocities[i] = (Math.random() - 0.5) * 0.01;
      velocities[i + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i + 2] = (Math.random() - 0.5) * 0.01;

      color.set(Math.random() > 0.5 ? '#8b5cf6' : '#ec4899'); // Purple or Pink
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    return { positions, colors, velocities };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current?.geometry) {
      const pos = particlesRef.current.geometry.attributes.position.array;
      const vel = velocities;

      const mouse3D = new THREE.Vector3(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0
      );

      for (let i = 0; i < count * 3; i += 3) {
        const x = pos[i];
        const y = pos[i + 1];
        const z = pos[i + 2];

        const particleVec = new THREE.Vector3(x, y, z);
        const distance = particleVec.distanceTo(mouse3D);

        // Mouse interaction: push particles away
        if (distance < 2.5) {
          const forceDirection = particleVec.sub(mouse3D).normalize().multiplyScalar(0.1);
          vel[i] += forceDirection.x;
          vel[i + 1] += forceDirection.y;
        }

        // Apply velocity and damping
        pos[i] += vel[i];
        pos[i + 1] += vel[i + 1];
        pos[i + 2] += vel[i + 2];
        vel[i] *= 0.98;
        vel[i + 1] *= 0.98;
        vel[i + 2] *= 0.98;

        // Wrap around boundaries
        if (pos[i] > 20 || pos[i] < -20) vel[i] = -vel[i];
        if (pos[i + 1] > 20 || pos[i + 1] < -20) vel[i + 1] = -vel[i + 1];
        if (pos[i + 2] > 20 || pos[i + 2] < -20) vel[i + 2] = -vel[i + 2];
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if(groupRef.current) {
        groupRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.025} vertexColors sizeAttenuation depthWrite={false} transparent opacity={0.9} />
      </points>
    </group>
  );
}

// 2. 🎨 ENHANCED: Main Hero Section Component
export function HeroSection() {
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
    };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <InteractiveParticles />
        </Canvas>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex items-center justify-center min-h-screen px-4"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 relative">
            Welcome to{' '}
            <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    EventFlow
                </span>
                <motion.div
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
                />
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Revolutionize your event management experience with cutting-edge technology and seamless student authentication.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(139, 92, 246, 0.5)" }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full text-lg shadow-lg transition-shadow duration-300">
              Get Started
            </motion.button>

            <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.2)' }} whileTap={{ scale: 0.95 }} className="px-8 py-4 border-2 border-purple-500 text-purple-400 font-semibold rounded-full text-lg transition-colors duration-300">
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
