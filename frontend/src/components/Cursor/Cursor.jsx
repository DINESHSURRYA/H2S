import React, { useState, useEffect } from 'react';
import styles from './Cursor.module.css';

/**
 * Enhanced Cyberpunk Cursor with GH Trailing.
 * Logic:
 * 1. Primary Pointer: Absolute mouse tracking (Arrow/Dot).
 * 2. Trailing Element: Delayed "GH" text with smoothing.
 * 3. Interaction: Dynamic color shifting on hover.
 * @returns {JSX.Element} - Styled interactive cursor component.
 */
const Cursor = () => {
  // Real-time mouse coordinates for the primary pointer
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Delayed coordinates for the "GH" trailing effect
  const [trailPos, setTrailPos] = useState({ x: 0, y: 0 });
  // Interaction check for buttons/links
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Tracking primary pointer move
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setMousePos({ x, y });
    };

    // Tracking hover detection for interactive elements (Clean architecture integration)
    const handleMouseOver = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a');
        
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    let animationFrame;
    const updateTrail = () => {
      // Smoothing logic: "GH" catches up to mouse with 10% interpolation (Delayed motion)
      setTrailPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1,
      }));
      animationFrame = requestAnimationFrame(updateTrail);
    };
    updateTrail();
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePos]);

  return (
    <>
      {/* Primary Clicking Pointer: Small arrow/dot with high precision */}
      <div 
        className={styles.pointer}
        style={{ left: mousePos.x, top: mousePos.y }}
      >
        <div className={styles.arrow} />
      </div>

      {/* Trailing GH Label: Styled with cinematic delay and reactive colors */}
      <div 
        className={`${styles.ghTrail} ${isHovering ? styles.hoverActive : ''}`}
        style={{ left: trailPos.x, top: trailPos.y }}
      >
        <span className={styles.ghText}>GH</span>
        {/* Particle trail for added 'style' depth */}
        <div className={styles.glowPulse} />
      </div>
    </>
  );
};

export default Cursor;
