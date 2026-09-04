import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Search, Download, X, Maximize2, ChevronLeft, Image as ImageIcon, LayoutGrid, Sparkles, Flame, Smartphone, Monitor } from 'lucide-react';
import { WALLPAPER_DATA } from './wallpaperData';
import { CONTRIBUTORS_DATA } from './contributorsData';






/**
 * Fisher-Yates Shuffle
 * Returns a new shuffled array without mutating the original.
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Shuffle the collection once per page load to ensure a stable randomized order
const SHUFFLED_WALLPAPERS = shuffleArray(WALLPAPER_DATA);



/**
 * Inline Instagram SVG Icon
 */
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

/**
 * Utility to extract Instagram username from URL
 */
const getInstagramUsername = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts.length > 0 ? `@${pathParts[0]}` : 'Instagram Profile';
  } catch (e) {
    return 'Instagram Profile';
  }
};

/**
 * Reusable Contributors Button with Dropdown Panel
 */
const ContributorsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 sm:top-6 sm:right-8 z-50"
      ref={dropdownRef}
      onMouseEnter={() => window.innerWidth >= 768 && setIsOpen(true)}
      onMouseLeave={() => window.innerWidth >= 768 && setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative px-6 py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-full transition-all duration-500 flex items-center justify-center shadow-2xl"
      >
        <span className="relative z-10 text-xs uppercase tracking-[0.2em] font-medium text-white/90 group-hover:text-white transition-colors bg-clip-text">
          <span className="animate-shine bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] bg-[length:200%_100%] bg-clip-text text-transparent">
            Contributors
          </span>
        </span>
      </button>

      
      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full right-0 pt-3 transition-all duration-500 origin-top-right ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4 pb-3 border-b border-white/5 font-medium">Core Team</h4>
        <div className="flex flex-col gap-1">
          {CONTRIBUTORS_DATA.map(contributor => (
            <div key={contributor.id} className="flex flex-col gap-1.5 p-2.5 -mx-2 rounded-xl hover:bg-white/5 transition-colors group/item">
              <span className="text-sm font-medium text-zinc-200 group-hover/item:text-white transition-colors tracking-wide">{contributor.name}</span>
              <a 
                href={contributor.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
                onClick={(e) => e.stopPropagation()}
              >
                <InstagramIcon size={14} className="group-hover/item:text-pink-500 transition-colors" />
                <span>{getInstagramUsername(contributor.instagram)}</span>
              </a>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Utility function to handle direct image downloads
 */
const downloadWallpaper = async (e, wallpaper) => {
  if (e) e.stopPropagation();
  
  try {
    const response = await fetch(wallpaper.image);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Anantachitra-${wallpaper.id}.jpg`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download wallpaper. Please try again.');
  }
};

/**
 * Helper to get optimized image from Cloudinary
 * Injects f_auto, q_auto, w_{width}, c_limit before the version /v.../ segment
 */
const getOptimizedImage = (url, width) => {
  if (!url || typeof url !== 'string') return url;
  
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  
  return url;
};

/**
 * Advanced Three.js Plexus Animation
 * Morphs particles between various geometric shapes to simulate brain, DNA, rings, etc.
 */
const ParticleBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    mount.appendChild(renderer.domElement);

    // 2. Particle Configuration
    const particleCount = 350; // Optimized for PC performance (Prevents lag/freezing)
    const particles = new THREE.BufferGeometry();
    
    // Arrays to hold current positions and target positions for morphing
    const positions = new Float32Array(particleCount * 3);
    const targets = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initial random positions
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 400;
      targets[i] = positions[i]; // Start targets at current
      
      const colorIntensity = 0.8 + Math.random() * 0.2;
      if (i % 3 === 0) colors[i] = colorIntensity;         
      if (i % 3 === 1) colors[i] = colorIntensity * 0.95;  
      if (i % 3 === 2) colors[i] = 1.0;                    
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    
    const pointCloud = new THREE.Points(particles, pMaterial);
    scene.add(pointCloud);

    // 3. Line Setup (Plexus Effect)
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    
    const linesGeometry = new THREE.BufferGeometry();
    const maxLines = particleCount * 4; 
    const linePositions = new Float32Array(maxLines * 3 * 2);
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // 4. Shape Generators for Morphing
    const shapes = {
      brainSphere: () => {
        for (let i = 0; i < particleCount; i++) {
          const r = 100 + Math.random() * 30; // Lumpy sphere
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos((Math.random() * 2) - 1);
          targets[i*3] = r * Math.sin(phi) * Math.cos(theta);
          targets[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
          targets[i*3+2] = r * Math.cos(phi);
        }
      },
      dnaHelix: () => {
        for (let i = 0; i < particleCount; i++) {
          const t = (i / particleCount) * Math.PI * 8; 
          const radius = 40;
          const heightOffset = (i / particleCount) * 300 - 150;
          const phase = i % 2 === 0 ? 0 : Math.PI;
          const noise = (Math.random() - 0.5) * 10;
          targets[i*3] = Math.cos(t + phase) * radius + noise;
          targets[i*3+1] = heightOffset + noise;
          targets[i*3+2] = Math.sin(t + phase) * radius + noise;
        }
      },
      flower: () => {
        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * 2 * Math.PI;
          // 5-petal rose curve
          const r = 120 * Math.cos(5 * theta);
          const z = (Math.random() - 0.5) * 20; 
          targets[i*3] = r * Math.cos(theta);
          targets[i*3+1] = r * Math.sin(theta);
          targets[i*3+2] = z;
        }
      },
      butterfly: () => {
        for (let i = 0; i < particleCount; i++) {
          const t = Math.random() * 2 * Math.PI;
          // Parametric butterfly equation
          const e = Math.E;
          const r = 40 * (Math.pow(e, Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5));
          targets[i*3] = r * Math.sin(t);
          targets[i*3+1] = r * Math.cos(t);
          targets[i*3+2] = (Math.random() - 0.5) * 10;
        }
      },
      tree: () => {
        for (let i = 0; i < particleCount; i++) {
          if (Math.random() > 0.7) { 
            // Trunk
            targets[i*3] = (Math.random() - 0.5) * 15;
            targets[i*3+1] = -100 + Math.random() * 80;
            targets[i*3+2] = (Math.random() - 0.5) * 15;
          } else { 
            // Canopy
            const h = Math.random() * 120;
            const radius = (120 - h) * 0.7; 
            const theta = Math.random() * 2 * Math.PI;
            targets[i*3] = radius * Math.cos(theta);
            targets[i*3+1] = h - 20;
            targets[i*3+2] = radius * Math.sin(theta);
          }
        }
      },
      cyberRing: () => {
        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * 2 * Math.PI;
          const mainRadius = 120;
          const tubeRadius = Math.random() * 20;
          const phi = Math.random() * 2 * Math.PI;
          targets[i*3] = (mainRadius + tubeRadius * Math.cos(phi)) * Math.cos(theta);
          targets[i*3+1] = tubeRadius * Math.sin(phi);
          targets[i*3+2] = (mainRadius + tubeRadius * Math.cos(phi)) * Math.sin(theta);
        }
      },
      sciFiCar: () => {
        for (let i = 0; i < particleCount; i++) {
           const x = (Math.random() - 0.5) * 180; // length
           const z = (Math.random() - 0.5) * 70; // width
           let y = (Math.random() - 0.5) * 25; // base height
           if (Math.random() > 0.6 && x > -20 && x < 50) y += 25 + Math.random() * 15; // Cab
           if ((x > 40 || x < -60) && (z > 30 || z < -30)) y -= 15; // Wheels
           targets[i*3] = x;
           targets[i*3+1] = y;
           targets[i*3+2] = z;
        }
      },
      cube: () => {
        const size = 150;
        for (let i = 0; i < particleCount; i++) {
          targets[i*3] = (Math.random() - 0.5) * size;
          targets[i*3+1] = (Math.random() - 0.5) * size;
          targets[i*3+2] = (Math.random() - 0.5) * size;
        }
      }
    };

    const shapeKeys = Object.keys(shapes);
    let currentShapeIndex = 0;

    // Shape transition interval (Cycle every 6 seconds)
    const morphInterval = setInterval(() => {
      currentShapeIndex = (currentShapeIndex + 1) % shapeKeys.length;
      shapes[shapeKeys[currentShapeIndex]]();
    }, 6000);

    // Initial shape
    shapes.brainSphere();

    // 5. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      frameCount++;
      
      const positionsAttr = pointCloud.geometry.attributes.position;
      const posArray = positionsAttr.array;
      
      // Morphing Lerp factor
      const lerpFactor = 0.02;

      // Update positions towards targets
      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] += (targets[i] - posArray[i]) * lerpFactor;
      }
      positionsAttr.needsUpdate = true;

      // Slow global rotation
      pointCloud.rotation.y += 0.001;
      pointCloud.rotation.x += 0.0005;
      linesMesh.rotation.y = pointCloud.rotation.y;
      linesMesh.rotation.x = pointCloud.rotation.x;

      // Update Lines (Plexus effect) based on distance
      // Performance optimization: Only recalculate lines every 2nd frame
      if (frameCount % 2 === 0) {
        let lineIndex = 0;
        const maxDistance = 45; 
        
        for (let i = 0; i < particleCount; i++) {
          for (let j = i + 1; j < particleCount; j++) {
            const dx = posArray[i*3] - posArray[j*3];
            const dy = posArray[i*3+1] - posArray[j*3+1];
            const dz = posArray[i*3+2] - posArray[j*3+2];
            const distSq = dx*dx + dy*dy + dz*dz;

            if (distSq < maxDistance * maxDistance && lineIndex < maxLines) {
              linePositions[lineIndex * 6] = posArray[i*3];
              linePositions[lineIndex * 6 + 1] = posArray[i*3+1];
              linePositions[lineIndex * 6 + 2] = posArray[i*3+2];
              
              linePositions[lineIndex * 6 + 3] = posArray[j*3];
              linePositions[lineIndex * 6 + 4] = posArray[j*3+1];
              linePositions[lineIndex * 6 + 5] = posArray[j*3+2];
              
              lineIndex++;
            }
          }
        }
        linesMesh.geometry.setDrawRange(0, lineIndex * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(morphInterval);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount) {
        try {
          mount.removeChild(renderer.domElement);
        } catch (e) {
          // Ignore if child doesn't exist
        }
      }
      pMaterial.dispose();
      particles.dispose();
      linesMaterial.dispose();
      linesGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 bg-[#050505] overflow-hidden pointer-events-none" />;
};

/**
 * Individual Wallpaper Card for the Masonry Grid
 */
const WallpaperCard = ({ wallpaper, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="group relative rounded-sm overflow-hidden bg-zinc-900 cursor-pointer w-full transform transition-all duration-500 ease-out hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-black/50"
      onClick={() => onClick(wallpaper)}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-zinc-800 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-zinc-600 opacity-50" />
        </div>
      )}
      
      {/* Actual Image with Lazy Loading */}
      <img
        src={getOptimizedImage(wallpaper.image, 800)}
        alt={wallpaper.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Interactive Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
        <h3 className="text-white font-medium text-lg tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {wallpaper.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          {wallpaper.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-zinc-300 uppercase tracking-wider bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
              {tag}
            </span>
          ))}
          {wallpaper.tags.length > 3 && (
            <span className="text-xs text-zinc-400 uppercase tracking-wider px-1 py-1">
              +{wallpaper.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Quick Download Button (Stops propagation to avoid opening viewer) */}
        <button 
          onClick={(e) => downloadWallpaper(e, wallpaper)}
          className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-white text-white hover:text-black"
          title="Download Original"
        >
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

/**
 * Fullscreen Cinematic Viewer Modal
 */
const WallpaperViewer = ({ wallpaper, onClose }) => {
  if (!wallpaper) return null;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = (e) => {
    downloadWallpaper(e, wallpaper);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-2 flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          <ChevronLeft size={20} /> Back to Collection
        </button>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="w-full h-full p-4 sm:p-12 md:p-24 flex items-center justify-center relative overflow-hidden" onClick={onClose}>
        <img 
          src={wallpaper.image} 
          alt={wallpaper.title}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-scale-up"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
        />
      </div>

      {/* Bottom Info & Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 z-10 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 tracking-wide">{wallpaper.title}</h2>
          <div className="flex flex-wrap gap-2">
            {wallpaper.tags.map(tag => (
              <span key={tag} className="text-xs sm:text-sm text-zinc-300 uppercase tracking-widest border border-zinc-700 px-3 py-1.5 rounded-sm bg-black/50 backdrop-blur-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleDownload}
          className="pointer-events-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-sm hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm font-medium shrink-0 group"
        >
          <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
          Download 4K
        </button>
      </div>
    </div>
  );
};

/**
 * Landing Page Component
 */
const LandingPage = ({ onEnterCollection }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-black text-white">
      {/* 3D Background */}
      <ParticleBackground />

      {/* Content Overlay */}
      <div className="z-10 flex flex-col items-center text-center px-4 mix-blend-difference pointer-events-none">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-extralight tracking-tighter mb-6 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          ANANTA<span className="font-semibold">CHITRA</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl font-light tracking-widest text-zinc-300 max-w-2xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          An endless collection of images worth getting lost in.
        </p>

        <button 
          onClick={onEnterCollection}
          className="pointer-events-auto group relative px-8 py-4 bg-transparent text-white border border-white/30 hover:border-white transition-all duration-500 overflow-hidden rounded-sm animate-fade-up"
          style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
        >
          <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
          <span className="relative z-10 flex items-center gap-2 text-sm uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-500">
            View Collection
            <Maximize2 size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </span>
        </button>
      </div>

      {/* Creator Credit */}
      <div className="absolute bottom-8 z-10 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-light">
          Created by Sandipan Paul
        </p>
      </div>
    </div>
  );
};

/**
 * Responsive Masonry Grid Component
 */
const MasonryGrid = ({ items, renderItem, minColumnWidth = 320 }) => {
  const [columns, setColumns] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      // Calculate max columns based on minimum width per column
      let maxCols = Math.floor(width / minColumnWidth) || 1;
      
      // Ensure we don't create empty columns on the right
      let actualCols = Math.min(maxCols, items.length);
      
      // Ensure at least 1 column
      actualCols = Math.max(1, actualCols);
      
      setColumns(actualCols);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [items.length, minColumnWidth]);

  // Distribute items into columns (round-robin)
  const columnData = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    columnData[index % columns].push(item);
  });

  return (
    <div ref={containerRef} className="flex w-full gap-4 sm:gap-6 items-start">
      {columnData.map((colItems, colIndex) => (
        <div key={colIndex} className="flex flex-col flex-1 gap-4 sm:gap-6 w-full">
          {colItems.map(item => renderItem(item))}
        </div>
      ))}
    </div>
  );
};

/**
 * Main Collection Page Component
 */
const CollectionPage = ({ onGoBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { id: 'All', icon: LayoutGrid },
    { id: 'Recent', icon: Sparkles },
    { id: 'Popular', icon: Flame },
    { id: 'Mobile', icon: Smartphone },
    { id: 'PC', icon: Monitor }
  ];
  
  // Memoize filtered results for performance with large datasets (up to 1000)
  const filteredWallpapers = useMemo(() => {
    let result = SHUFFLED_WALLPAPERS;

    // Apply category filter first
    if (activeCategory === "Recent") {
      result = [...WALLPAPER_DATA]
        .filter(wp => wp.image && wp.image.trim() !== "")
        .sort((a, b) => b.id - a.id)
        .slice(0, 20);
    } else if (activeCategory !== "All") {
      const cat = activeCategory.toLowerCase();
      result = result.filter(wp => wp.tags.some(tag => tag.toLowerCase() === cat));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(wp => 
        wp.tags.some(tag => tag.toLowerCase().includes(query)) ||
        wp.title.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Search Header - Sticky and minimal */}
      <header className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          
          {/* Back Button & Logo Minimal */}
          <div className="flex items-center gap-2 sm:gap-4 pr-3 sm:pr-6 shrink-0">
            <button 
              onClick={onGoBack}
              className="text-zinc-500 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"
              title="Return to Landing Page"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-xl sm:text-2xl font-light tracking-widest cursor-pointer hidden sm:block" onClick={onGoBack}>
              ANANTA<span className="font-semibold text-zinc-400">C.</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by tags (e.g., sci-fi, 4k, nature)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm leading-5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-0 transition-all duration-300 sm:text-sm tracking-wide"
            />
          </div>
        </div>
      </header>

      {/* Category Navigation Bar */}
      <div className="w-full bg-[#050505] border-b border-white/5 sticky top-20 sm:top-24 z-30 pt-4 pb-2 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-3 mx-auto w-max px-1">
              {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              let textClasses = "text-sm font-medium tracking-wide ";
              let iconClasses = "transition-colors ";
              
              if (isActive) {
                iconClasses += "text-white";
                if (category.id === 'Recent') {
                  textClasses += "animate-shine bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] bg-[length:200%_100%] bg-clip-text text-transparent";
                } else if (category.id === 'Popular') {
                  textClasses += "animate-gradient-text bg-[linear-gradient(to_right,#ff8a00,#e52e71,#9b2cff,#ff8a00)] bg-[length:200%_auto] bg-clip-text text-transparent";
                } else {
                  textClasses += "text-white";
                }
              } else {
                iconClasses += "text-zinc-400 group-hover:text-zinc-200";
                textClasses += "text-zinc-400 group-hover:text-zinc-200 transition-colors";
              }

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive 
                      ? "bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                      : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <Icon size={16} className={iconClasses} />
                  <span className={textClasses}>{category.id}</span>
                </button>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between text-zinc-500 text-sm tracking-widest uppercase">
          <span>{filteredWallpapers.length} Wallpapers</span>
          {searchQuery && <span>Results for "{searchQuery}"</span>}
        </div>

        {/* Dynamic Grid Layout (Responsive Flex Masonry) */}
        {filteredWallpapers.length > 0 ? (
          <MasonryGrid 
            items={filteredWallpapers}
            renderItem={(wp) => (
              <WallpaperCard 
                key={wp.id} 
                wallpaper={wp} 
                onClick={setSelectedWallpaper} 
              />
            )}
          />
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 sm:py-48 text-center animate-fade-in">
            <div className="w-16 h-16 mb-6 rounded-full border border-white/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-zinc-300 mb-2">No wallpapers found.</h3>
            <p className="text-zinc-500 tracking-wider">Try adjusting your search terms or tags.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-8 text-sm uppercase tracking-widest text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      {/* Fullscreen Viewer Modal */}
      {selectedWallpaper && (
        <WallpaperViewer 
          wallpaper={selectedWallpaper} 
          onClose={() => setSelectedWallpaper(null)} 
        />
      )}
    </div>
  );
};

/**
 * Root Application Component
 * Manages the high-level state between the Landing view and the Collection view.
 */
export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('anantachitra_view') || 'landing';
  });

  const handleNavigate = (view) => {
    sessionStorage.setItem('anantachitra_view', view);
    if (view === 'collection') {
      window.scrollTo(0, 0);
    }
    setCurrentView(view);
  };

  return (
    <div className="font-sans antialiased bg-[#050505] text-white selection:bg-white selection:text-black min-h-screen">
      <ContributorsButton />
      
      {/* 
        Injecting CSS safely using inline style tags to guarantee animations 
        trigger correctly without relying on useEffect lifecycles.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shine {
          to {
            background-position: -200% center;
          }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }

        @keyframes gradient-text {
          to {
            background-position: -200% center;
          }
        }
        .animate-gradient-text {
          animation: gradient-text 3s linear infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Custom Scrollbar for a premium feel */
        ::-webkit-scrollbar {
          width: 8px;
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        
        body {
          background-color: #050505;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}} />

      {currentView === 'landing' ? (
        <LandingPage onEnterCollection={() => handleNavigate('collection')} />
      ) : (
        <CollectionPage onGoBack={() => handleNavigate('landing')} />
      )}
    </div>
  );
}
