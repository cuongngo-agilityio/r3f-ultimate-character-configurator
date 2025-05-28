/**
 * @typedef {object} ExperienceProps
 * @property {number} [minPolarAngle=Math.PI / 4] - The minimum polar angle for OrbitControls.
 * @property {number} [maxPolarAngle=Math.PI / 2] - The maximum polar angle for OrbitControls.
 * @property {number} [minAzimuthAngle=-Math.PI / 4] - The minimum azimuth angle for OrbitControls.
 * @property {number} [maxAzimuthAngle=Math.PI / 4] - The maximum azimuth angle for OrbitControls.
 */

/**
 * The `Experience` component sets up the main 3D scene for the application.
 * It includes camera controls, environment lighting, a backdrop, soft shadows,
 * and multiple directional lights to illuminate the `Avatar` component.
 *
 * @param {ExperienceProps} props - The properties for the Experience component.
 * @returns {JSX.Element} A React Three Fiber scene setup.
 */

import {
  Backdrop,
  Environment,
  OrbitControls,
  SoftShadows,
} from "@react-three/drei";

import { Avatar } from "./Avatar";

export const Experience = () => {
  return (
    <>
      <OrbitControls
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
      <Environment preset="sunset" environmentIntensity={0.3} />
      <Backdrop scale={[50, 10, 5]} floor={1.5} receiveShadow position-z={-4}>
        <meshStandardMaterial color="#555" />
      </Backdrop>

      <SoftShadows size={52} samples={16} />

      {/* Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Fill Light */}
      <directionalLight position={[-5, 5, 5]} intensity={0.7} />

      {/* Back Lights */}
      <directionalLight position={[1, 0.1, -5]} intensity={3} color={"red"} />
      <directionalLight position={[-1, 0.1, -5]} intensity={8} color={"blue"} />

      <Avatar />
    </>
  );
};
