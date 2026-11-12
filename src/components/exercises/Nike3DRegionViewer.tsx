"use client";

import { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

// ─── Segmento → Regiones GLB ──────────────────────────────────────────────────
// Cubre todos los grupo_label de la master-registry
const SEGMENTO_TO_REGIONS: Record<string, string[]> = {
  // Columna
  Cervical:    ["CERVICAL", "SKULL"],
  Torácica:    ["THORAX_POST", "THORAX_ANT"],
  Lumbar:      ["LUMBAR_CORE"],
  Sacroilíaca: ["LUMBAR_CORE", "PELVIS_HIP"],
  Columna:     ["LUMBAR_CORE", "THORAX_POST", "CERVICAL"],
  // Extremidad superior
  Hombro:      ["SHOULDER_R", "SHOULDER_L", "ARM_R", "ARM_L"],
  Codo:        ["ARM_R", "ARM_L", "FOREARM_R", "FOREARM_L"],
  Muñeca:      ["FOREARM_R", "FOREARM_L"],
  "Muñeca / Mano": ["FOREARM_R", "FOREARM_L"],
  "ATM":       ["SKULL", "CERVICAL"],
  "ATM / Mandíbula": ["SKULL", "CERVICAL"],
  // Tronco
  Pecho:       ["THORAX_ANT"],
  Espalda:     ["THORAX_POST", "LUMBAR_CORE"],
  Core:        ["LUMBAR_CORE", "THORAX_ANT"],
  // Extremidad inferior
  Cadera:      ["PELVIS_HIP"],
  Glúteo:      ["PELVIS_HIP"],
  Rodilla:     ["KNEE", "THIGH"],
  Pierna:      ["THIGH", "KNEE"],
  Tobillo:     ["LOWER_LEG"],
  Pie:         ["LOWER_LEG"],
};

const BASE_COLOR = 0xd4cdc9;

// Extrae región desde nombre del mesh: "THORAX_ANT_003" → "THORAX_ANT"
function getRegionFromMesh(obj: THREE.Mesh): string {
  // Mesh name: "REGION_NAME_NNN" where NNN is 3 digits
  const m = obj.name.match(/^([A-Z][A-Z0-9_]+?)_(\d{3})$/);
  if (m) return m[1];
  // Fallback: material name prefix before "."
  const mat = obj.material as THREE.MeshStandardMaterial | undefined;
  if (mat?.name) return mat.name.split(".")[0].split(" ")[0];
  return "";
}

// ─── Modelo 3D ────────────────────────────────────────────────────────────────
function RegionModel({
  activeRegions,
  accentColor,
}: {
  activeRegions: string[];
  accentColor: string;
}) {
  const gltf = useLoader(GLTFLoader, "/models/nike3d-regions.glb");
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const highlightColor = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  // Centrar cámara sobre el modelo al cargar
  useEffect(() => {
    if (!modelRef.current) return;
    const box = new THREE.Box3().setFromObject(modelRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);
    modelRef.current.position.sub(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, maxDim * 1.8);
    camera.lookAt(0, 0, 0);
  }, [gltf, camera]);

  // Aplicar highlight según región activa
  useEffect(() => {
    if (!gltf?.scene) return;
    gltf.scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      // Clonar material la primera vez para no mutar el material compartido
      if (!obj.userData.matCloned) {
        obj.material = (obj.material as THREE.Material).clone();
        obj.userData.matCloned = true;
      }
      const m = obj.material as THREE.MeshStandardMaterial;
      const region = getRegionFromMesh(obj);
      const isActive = activeRegions.length > 0 && activeRegions.includes(region);
      if (isActive) {
        m.color.set(highlightColor);
        m.emissive.set(highlightColor);
        m.emissiveIntensity = 0.4;
        m.roughness = 0.35;
        m.metalness = 0.1;
      } else {
        m.color.setHex(BASE_COLOR);
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
        m.roughness = 0.85;
        m.metalness = 0;
      }
      m.needsUpdate = true;
    });
  }, [activeRegions, highlightColor, gltf]);

  return <primitive ref={modelRef} object={gltf.scene} />;
}

function ModelFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[20, 80, 8, 16]} />
      <meshStandardMaterial color={0xd4cdc9} wireframe />
    </mesh>
  );
}

// ─── API pública ──────────────────────────────────────────────────────────────
export interface Nike3DRegionViewerProps {
  segmento?: string;
  accentColor?: string;
  className?: string;
  height?: string | number;
}

export function Nike3DRegionViewer({
  segmento,
  accentColor = "#3b82f6",
  className = "",
  height = 420,
}: Nike3DRegionViewerProps) {
  const [ready, setReady] = useState(false);

  const activeRegions = useMemo(() => {
    if (!segmento) return [];
    return SEGMENTO_TO_REGIONS[segmento] ?? [];
  }, [segmento]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{ height: heightStyle, background: "#f4f3f1" }}
    >
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-slate-50">
          <div
            className="w-8 h-8 rounded-full border-[3px] animate-spin"
            style={{
              borderColor: `${accentColor}30`,
              borderTopColor: accentColor,
            }}
          />
          <span className="text-xs text-slate-400">Cargando modelo 3D…</span>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 600], fov: 42, near: 1, far: 5000 }}
        onCreated={() => setReady(true)}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[150, 350, 250]} intensity={1.3} />
        <directionalLight position={[-150, 50, -200]} intensity={0.35} />

        <Suspense fallback={<ModelFallback />}>
          <RegionModel activeRegions={activeRegions} accentColor={accentColor} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={80}
          maxDistance={1400}
          minPolarAngle={Math.PI * 0.05}
          maxPolarAngle={Math.PI * 0.95}
          autoRotate={activeRegions.length === 0}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {segmento && (
        <div
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-md"
          style={{ background: accentColor }}
        >
          {segmento}
        </div>
      )}
      <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 select-none pointer-events-none">
        Arrastra · Scroll para zoom
      </div>
    </div>
  );
}
