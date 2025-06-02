import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { UI } from "./components/UI";
import { Experience } from "./components/Experience";
import { DEFAULT_CAMERA_POSITION } from "./components/CameraManager";

function App() {
  return (
    <>
      <Leva hidden />
      <UI />
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: 45,
        }}
        gl={{
          preserveDrawingBuffer: true,
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
