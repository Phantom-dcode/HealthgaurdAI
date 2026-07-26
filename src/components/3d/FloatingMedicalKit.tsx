import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const FloatingMedicalKit: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 3, 50); // Cyan glow
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2, 50); // Emerald glow
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Group for rotating medical assembly
    const group = new THREE.Group();

    // 1. Central Heart Torus Ring
    const torusGeo = new THREE.TorusGeometry(1.4, 0.22, 32, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    group.add(torusMesh);

    // 2. Inner Pulsing Core Sphere
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 3. Floating Orbiting Nodes (Medical Sensors)
    const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
    });

    const nodesCount = 6;
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodesCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodesCount) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, (Math.random() - 0.5) * 0.5);
      group.add(node);
      nodes.push(node);
    }

    // 4. Particle Field for Vitals Streaming Data
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    scene.add(group);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Slow floating rotation
      group.rotation.x = Math.sin(elapsedTime * 0.4) * 0.2;
      group.rotation.y = elapsedTime * 0.5;
      group.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      // Pulse inner core
      const scale = 1 + Math.sin(elapsedTime * 3) * 0.08;
      coreMesh.scale.set(scale, scale, scale);

      // Rotate orbiting nodes
      nodes.forEach((node, idx) => {
        const angle = (idx / nodesCount) * Math.PI * 2 + elapsedTime * 0.8;
        node.position.x = Math.cos(angle) * 2.2;
        node.position.y = Math.sin(angle) * 2.2;
      });

      // Slowly rotate particle field
      particleSystem.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full min-h-[320px] relative rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      id="3d-floating-medical-kit"
    />
  );
};
