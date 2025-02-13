'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeartBackground() {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; rotation: number }>>([]);

  useEffect(() => {
    const createHeart = () => {
      const heart = document.createElement('div');
      heart.className = 'heart';
      
      // Enhanced randomization
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.top = '-50px';
      
      const size = Math.random() * (30 - 10) + 10;
      heart.style.width = `${size}px`;
      heart.style.height = `${size}px`;
      
      // Add more varied animations
      heart.style.animationDuration = `${Math.random() * 3 + 2}s`;
      heart.style.opacity = (Math.random() * 0.5 + 0.3).toString();
      
      // Add floating animation
      heart.style.animation = `
        heartFall ${Math.random() * 3 + 2}s linear forwards,
        heartFloat ${Math.random() * 2 + 1}s ease-in-out infinite
      `;
      
      const heartsContainer = document.querySelector('.hearts');
      heartsContainer?.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 6000);
    };

    const createHearts = () => {
      const interval = setInterval(() => {
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
          createHeart();
        }
      }, 300);

      return interval;
    };

    // Add confetti effect
    const showConfetti = () => {
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        rotation: Math.random() * 360
      }));
      setConfetti(newConfetti);
      
      setTimeout(() => {
        setConfetti([]);
      }, 5000);
    };

    const interval = createHearts();
    showConfetti(); // Show initial confetti

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hearts" />
      <AnimatePresence>
        {confetti.map(({ id, x, rotation }) => (
          <motion.div
            key={id}
            initial={{ y: -20, x, rotate: rotation, scale: 0 }}
            animate={{ y: window.innerHeight + 20, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-500
                     rounded-full shadow-lg"
            style={{ left: x }}
          />
        ))}
      </AnimatePresence>
    </>
  );
} 