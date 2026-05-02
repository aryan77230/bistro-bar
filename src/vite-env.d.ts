/// <reference types="vite/client" />

// Static binary asset imports. `*.png/.jpg` are already covered by
// vite/client; GLB is not — declare it ourselves.
declare module '*.glb' {
  const src: string;
  export default src;
}

// MeshLine ships without its own TypeScript types.
declare module 'meshline' {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
