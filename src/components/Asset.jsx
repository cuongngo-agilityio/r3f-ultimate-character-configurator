/**
 * @file Asset.jsx
 * @description A React component that loads and renders a 3D asset (GLTF model)
 * with customizable materials and skinning. It integrates with a global
 * configuration store to apply colors and shared materials.
 */

/**
 * The Asset component loads a 3D model from a given URL, applies customizations
 * such as color and skin material, and renders it as a skinned mesh.
 *
 * @component
 * @param {object} props - The properties for the Asset component.
 * @param {string} props.url - The URL of the GLTF model to load. This prop is required.
 * @param {string} props.categoryName - The name of the category this asset belongs to.
 *   This is used to fetch the appropriate color from the configurator store. This prop is required.
 * @param {THREE.Skeleton} props.skeleton - The skeleton to be used for skinning the mesh.
 *   This prop is required.
 * @throws {Error} If `url` is not provided or is not a string.
 * @throws {Error} If `categoryName` is not provided or is not a string.
 * @throws {Error} If `skeleton` is not provided.
 * @returns {JSX.Element[] | null} An array of `skinnedMesh` components representing the loaded asset,
 *   or null if the asset is still loading or an error occurred.
 *
 * @example
 * import { Skeleton } from "three";
 * // ...
 * const mySkeleton = new Skeleton(...);
 * // ...
 * <Asset
 *   url="/path/to/model.gltf"
 *   categoryName="hair"
 *   skeleton={mySkeleton}
 * />
 */
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useConfiguratorStore } from "../store";

export const Asset = ({ url, categoryName, skeleton }) => {
  // Validate URL
  if (!url || typeof url !== "string") {
    throw new Error("Asset: 'url' prop is required and must be a string");
  }

  // Validate categoryName
  if (!categoryName || typeof categoryName !== "string") {
    throw new Error(
      "Asset: 'categoryName' prop is required and must be a string"
    );
  }

  // Validate skeleton
  if (!skeleton) {
    throw new Error("Asset: 'skeleton' prop is required");
  }

  /** Loads the GLTF model from the provided URL.
   * `scene` contains the 3D model's hierarchy.
   */
  const { scene } = useGLTF(url);

  /**
   * Retrieves the customization state from the global store.
   * `customization` holds the current configuration of all categories.
   */
  const customization = useConfiguratorStore((state) => state.customization);

  /**
   * Retrieves the `lockedGroups` state from the global store.
   * `lockedGroups` is an object where keys are names of categories
   * that are currently "locked" by another selected asset, and values
   * provide details about which asset is causing the lock.
   */
  const lockedGroups = useConfiguratorStore((state) => state.lockedGroups);

  // Gets the specific color for the current asset's category from the customization state.
  const assetColor = customization[categoryName].color;

  // Retrieves the shared skin material from the global store.
  // This material is used for meshes that require a skin texture,
  // such as character models.
  const skin = useConfiguratorStore((state) => state.skin);

  /**
   * useEffect hook to update the material color of meshes in the scene.
   * This effect runs when the `assetColor` or `scene` changes.
   * It traverses the scene and updates the color of materials
   * whose names include "Color_".
   */
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.material?.name.includes("Color_")) {
          child.material.color.set(assetColor);
        }
      }
    });
  }, [assetColor, scene]);

  /**
   * Memoized array of objects representing the meshes to be rendered.
   * Each object contains the geometry and material for a mesh.
   * If a material name includes "Skin_", the shared skin material is used;
   * otherwise, the mesh's own material is used.
   * This is recalculated only when the scene or skin material changes.
   */
  const attachedItems = useMemo(() => {
    const items = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        items.push({
          geometry: child.geometry,
          material: child.material.name.includes("Skin_")
            ? skin
            : child.material,
        });
      }
    });
    return items;
  }, [scene]);

  if (lockedGroups[categoryName]) {
    return null;
  }

  /**
   * Returns a list of skinnedMesh components for each item in the attachedItems array.
   * Each skinnedMesh is configured with the geometry, material, and skeleton.
   * The skinnedMesh components are used to render the 3D models with the specified
   * geometry and material, while also applying the skeleton for animations.
   * Each skinnedMesh is given a unique key based on its index in the array.
   * The skinnedMesh components are set to cast and receive shadows.
   */
  return attachedItems.map((item, index) => (
    <skinnedMesh
      key={index}
      geometry={item.geometry}
      material={item.material}
      skeleton={skeleton}
      castShadow
      receiveShadow
    />
  ));
};
