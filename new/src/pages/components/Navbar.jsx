import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LayoutDashboard, Calendar, BarChart2, User, Menu, X, Ticket, Mail, Lock, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

// Helper for combining tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 1. Interactive Particle Background Component (No changes here)
function ParticleBackground() {
  const mouse = useRef([0, 0]);
  const groupRef = useRef(null);

  const onMouseMove = (e) => {
    mouse.current = [e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2];
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const count = 5000;
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const d = new THREE.Vector3();
    for (let i = 0; i < count * 3; i += 3) {
      d.set((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25);
      d.normalize().multiplyScalar(5 + Math.random() * 5);
      temp.set([d.x, d.y, d.z], i);
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
      const targetRotationX = (mouse.current[1] * 0.0002);
      const targetRotationY = (mouse.current[0] * 0.0002);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y + targetRotationY, 0.02);
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#9333ea" sizeAttenuation={true} depthWrite={false} />
      </points>
    </group>
  );
}

// 2. ✨ NEW: Professional Auth Form Component
const AuthForm = ({ initialView = 'login', onClose }) => {
    const [view, setView] = useState(initialView);

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: -50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } },
        exit: { scale: 0.9, opacity: 0, y: -50, transition: { duration: 0.2 } },
    };
    
    return (
        <motion.div
            key="auth-modal"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
                className="relative w-[90%] max-w-md rounded-2xl border border-white/20 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
                
                <div className="flex justify-center gap-8 mb-6">
                    <button onClick={() => setView('login')} className="relative text-lg font-medium text-white">
                        लॉग इन
                        {view === 'login' && <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500" layoutId="underline" />}
                    </button>
                    <button onClick={() => setView('signup')} className="relative text-lg font-medium text-white">
                        साइन अप
                        {view === 'signup' && <motion.div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500" layoutId="underline" />}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {view === 'login' ? <LoginForm /> : <SignupForm />}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const LoginForm = () => (
    <form className="space-y-6">
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="ईमेल" className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="password" placeholder="पासवर्ड" className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-purple-600 py-3 text-white font-semibold transition hover:bg-purple-700">
            लॉग इन करें
        </button>
    </form>
);

const SignupForm = () => (
     <form className="space-y-6">
        <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="पूरा नाम" className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="ईमेल" className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="password" placeholder="पासवर्ड बनाएँ" className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-purple-600 py-3 text-white font-semibold transition hover:bg-purple-700">
            अकाउंट बनाएँ
        </button>
    </form>
);


// 3. 🎨 UPDATED: The Main Navbar Component
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check user role (simplified - in real app, check from Firestore)
        // For demo, assume admin if email contains 'admin'
        setUserRole(user.email.includes('admin') ? 'admin' : 'student');
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAuthModal = (view) => {
      setAuthView(view);
      setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navItems = user ? [
    { label: 'Dashboard', href: userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Events', href: '#', icon: <Calendar size={18} /> },
    { label: 'Analytics', href: '#', icon: <BarChart2 size={18} /> },
    { label: 'Profile', href: '#', icon: <User size={18} /> },
  ] : [
    { label: 'Dashboard', href: '#', icon: <LayoutDashboard size={18} /> },
    { label: 'Events', href: '#', icon: <Calendar size={18} /> },
    { label: 'Analytics', href: '#', icon: <BarChart2 size={18} /> },
    { label: 'Profile', href: '#', icon: <User size={18} /> },
  ];

  const mobileMenuVariants = {
    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { opacity: 0, y: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={cn(
          "fixed top-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2",
          "rounded-xl border border-white/10 bg-black/20 shadow-lg backdrop-blur-md",
          "overflow-hidden"
        )}
      >
        <div className="absolute top-0 left-0 w-full h-full z-0">
           <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.5} />
              <ParticleBackground />
          </Canvas>
        </div>
        <div className="relative z-10 p-3">
          <div className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-2 text-white">
              <Ticket className="text-purple-400" />
              <span className="text-lg font-bold">EventFlow</span>
            </a>
            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-300">
                    Welcome, {userRole === 'admin' ? 'Admin' : 'Student'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <a href="/login" className="rounded-md px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                    Log In
                  </a>
                  <a href="/signup" className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700">
                    Sign Up
                  </a>
                </>
              )}
            </div>
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div variants={mobileMenuVariants} initial="closed" animate="open" exit="closed" className="mt-4 flex flex-col gap-4 md:hidden">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="flex items-center gap-3 rounded-md px-4 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                    {item.icon}
                    {item.label}
                  </a>
                ))}
                <div className="mt-2 border-t border-white/10 pt-4">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-gray-300 text-center">
                        Welcome, {userRole === 'admin' ? 'Admin' : 'Student'}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleOpenAuthModal('login')} className="w-full rounded-md px-4 py-2 text-left text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                        Log In
                      </button>
                      <button onClick={() => handleOpenAuthModal('signup')} className="mt-2 w-full rounded-md bg-purple-600 px-4 py-2 text-left text-white transition-colors hover:bg-purple-700">
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
      
      {/* Auth Form Modal Render */}
      <AnimatePresence>
        {isAuthModalOpen && <AuthForm initialView={authView} onClose={() => setIsAuthModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

