import { Canvas } from "@react-three/fiber";
import { UI } from "./components/UI";
import { Experience } from "./components/Experience";
import { DEFAULT_CAMERA_POSITION } from "./components/CameraManager";

function App() {
  return (
    <>
      <UI />
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: 45,
        }}
        shadows
      >
        <color attach="background" args={["#555"]} />
        <fog attach="fog" args={["#555", 15, 25]} />
        <group position-y={-1}>
          <Experience />
        </group>
      </Canvas>
    </>
  );
}

export default App;
