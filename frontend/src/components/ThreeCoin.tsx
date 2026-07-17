import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCoinProps {
  className?: string;
  size?: number; // scale multiplier
}

export const ThreeCoin: React.FC<ThreeCoinProps> = ({ className = '', size = 1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Group Pivot for Mouse Tilt
    const coinGroup = new THREE.Group();
    coinGroup.scale.set(size, size, size);
    scene.add(coinGroup);

    // 3. Gold Metallic Coin Geometry & Material
    // Thin cylinder (the body)
    const geometry = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 64, 1, false);
    const material = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,       // Royal Gold
      metalness: 0.95,       // Highly polished metal
      roughness: 0.15,       // High gloss
    });

    const coinMesh = new THREE.Mesh(geometry, material);
    coinMesh.rotation.x = Math.PI / 2; // Flat face facing camera
    coinGroup.add(coinMesh);

    // Add gold rings on the faces for coin borders
    const ringGeo = new THREE.TorusGeometry(1.65, 0.05, 16, 100);
    
    const ringFront = new THREE.Mesh(ringGeo, material);
    ringFront.position.z = 0.105;
    coinMesh.add(ringFront);

    const ringBack = new THREE.Mesh(ringGeo, material);
    ringBack.position.z = -0.105;
    coinMesh.add(ringBack);

    // 4. Lighting setup for realistic metallic shine
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Warm directional key light
    const dirLight1 = new THREE.DirectionalLight(0xfff5e6, 1.6);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    // Cool fill light
    const dirLight2 = new THREE.DirectionalLight(0x8a92ff, 0.6);
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    // Point light for center highlights
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 12);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    // 5. Mouse coordinates tracking
    let mouseX = 0;
    let mouseY = 0;
    const targetRotation = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      // Coordinates normalized to [-1, 1]
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Handle Container Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // 7. Animation Tick
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-spin on the local Y-axis of the coin mesh
      coinMesh.rotation.y += 0.012;

      // Mouse tilt applied to parent group pivot
      targetRotation.x = mouseY * 0.35;
      targetRotation.y = mouseX * 0.35;

      // Interpolation (lerp) for smooth movements
      coinGroup.rotation.x += (targetRotation.x - coinGroup.rotation.x) * 0.08;
      coinGroup.rotation.y += (targetRotation.y - coinGroup.rotation.y) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      // Memory cleanup
      geometry.dispose();
      ringGeo.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return <div ref={containerRef} className={`w-full h-full relative ${className}`} />;
};
