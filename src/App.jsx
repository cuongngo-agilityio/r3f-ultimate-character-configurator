import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function App() {
  return (
    <>
      <Canvas
        camera={{
          position: [3, 3, 3],
        }}
      >
        <color attach="background" args={["#333333"]} />
        <OrbitControls />
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshNormalMaterial />
        </mesh>
      </Canvas>
    </>
  );
}
