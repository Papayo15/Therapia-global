/**
 * Type augmentation for @react-three/fiber JSX elements.
 * Adds Three.js intrinsic elements (ambientLight, directionalLight, primitive, etc.)
 * to the React JSX namespace so TypeScript doesn't error on them.
 */

/* eslint-disable @typescript-eslint/no-namespace */
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      primitive: { object: unknown; [key: string]: unknown };
      ambientLight: { intensity?: number; [key: string]: unknown };
      directionalLight: {
        position?: [number, number, number] | number[];
        intensity?: number;
        [key: string]: unknown;
      };
      pointLight: { position?: [number, number, number] | number[]; intensity?: number; [key: string]: unknown };
      spotLight: { position?: [number, number, number] | number[]; intensity?: number; [key: string]: unknown };
      hemisphereLight: { intensity?: number; [key: string]: unknown };
      mesh: { [key: string]: unknown };
      group: { [key: string]: unknown };
      boxGeometry: { args?: number[]; [key: string]: unknown };
      meshStandardMaterial: { color?: string | number; [key: string]: unknown };
    }
  }
}
