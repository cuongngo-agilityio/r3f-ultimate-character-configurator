/**
 * Renders a 3D avatar model with customizable assets and animations.
 * This component integrates a base armature, an idle animation, and dynamically loads
 * different parts of the avatar (e.g., clothing, hair) based on the global
 * configuration state managed by `useConfiguratorStore`. It also
 * sets up a mechanism to download the current avatar configuration as a GLB file.
 *
 * The component utilizes `useGLTF` to load the base model (`/models/Armature.glb`),
 * `useFBX` for animations (`/models/Idle.fbx`), and `useAnimations` to control them.
 * Customizable assets, whose information is retrieved from the `customization` state,
 * are rendered using the `Asset` component. Each `Asset` is wrapped in `Suspense`
 * to handle asynchronous loading of its 3D model.
 *
 * Key functionalities include:
 * - **Dynamic Asset Loading**: Iterates over `customization` state to render `Asset` components
 *   for each selected item, using URLs constructed via `pb.files.getUrl`.
 * - **Animation Playback**: An idle animation ("mixamo.com") is played automatically
 *   when the component mounts.
 * - **GLB Export**: A `useEffect` hook initializes a `download` function that uses
 *   `GLTFExporter` to export the current avatar model. This function is made
 *   globally accessible through the `useConfiguratorStore` (via `setDownload`).
 *
 * @param {object} props - Props that are spread onto the main `group` element of the avatar.
 *                         These can include standard react-three-fiber group props like `position`,
 *                         `rotation`, `scale`, `dispose`, etc.
 * @returns {JSX.Element} A react-three-fiber `group` element containing the fully assembled
 *                          and animated avatar, ready for rendering in a R3F scene.
 *
 */

import { useAnimations, useFBX, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { GLTFExporter } from "three-stdlib";
import { pb, useConfiguratorStore } from "../store";
import { Asset } from "./Asset";

export const Avatar = ({ ...props }) => {
  const group = useRef();
  const { nodes } = useGLTF("/models/Armature.glb");
  const { animations } = useFBX("/models/Idle.fbx");
  const customization = useConfiguratorStore((state) => state.customization);
  const { actions } = useAnimations(animations, group);
  const setDownload = useConfiguratorStore((state) => state.setDownload);

  /**
   * useEffect hook to set up the download functionality.
   * This effect runs once after the initial render.
   * It defines a `download` function that exports the current avatar model as a GLB file.
   * The `download` function uses GLTFExporter to parse the scene and triggers a file save.
   * A helper `save` function is used to create a temporary link and click it to initiate the download.
   * The `setDownload` function from the configurator store is called to make the `download` function
   * accessible globally, for example, by a download button in the UI.
   */
  useEffect(() => {
    function download() {
      const exporter = new GLTFExporter();
      exporter.parse(
        group.current,
        function (result) {
          save(
            new Blob([result], { type: "application/octet-stream" }),
            `avatar_${+new Date()}.glb`
          );
        },
        function (error) {
          console.error(error);
        },
        { binary: true }
      );
    }

    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link); // Firefox workaround, see #6594

    function save(blob, filename) {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
    setDownload(download);
  }, []);

  /**
   * useEffect hook to play the Mixamo animation when the component mounts.
   * This effect runs once after the initial render.
   * It accesses the actions for "mixamo.com" and plays the animation.
   */
  useEffect(() => {
    actions["mixamo.com"]?.play();
  }, [actions]);

  /**
   * Renders the Avatar component.
   * It consists of a group that includes the main armature and dynamically loaded assets
   * based on the customization state.
   * - The main armature is loaded from `nodes.mixamorigHips`.
   * - Assets for each customization category are loaded using the `Asset` component.
   *   These are wrapped in `Suspense` to handle asynchronous loading.
   * - The `pb.files.getUrl` method is used to get the URL for each asset.
   * - The skeleton from `nodes.Plane.skeleton` is passed to each `Asset`.
   */
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorigHips} />
          {Object.keys(customization).map(
            (key) =>
              customization[key]?.asset?.url && (
                <Suspense key={customization[key].asset.id}>
                  <Asset
                    categoryName={key}
                    url={pb.files.getUrl(
                      customization[key].asset,
                      customization[key].asset.url
                    )}
                    skeleton={nodes.Plane.skeleton}
                  />
                </Suspense>
              )
          )}
        </group>
      </group>
    </group>
  );
};
