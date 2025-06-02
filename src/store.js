/**
 * @file Zustand store for managing character configurator state.
 * @module store
 */

/**
 * PocketBase instance for database interactions.
 * @type {import("pocketbase").default}
 */

/**
 * Zustand store for managing the character configurator's state.
 *
 * @typedef {object} ConfiguratorState
 * @property {Array<object>} categories - List of customization categories. Each category object may contain an `assets` array and an `expand.colorPalette` object.
 * @property {object|null} currentCategory - The currently selected customization category.
 * @property {Array<object>} assets - List of all available customization assets.
 * @property {import("three").MeshStandardMaterial} skin - The material used for the character's skin.
 * @property {object} customization - An object storing the current customization choices.
 *   The keys are category names, and values are objects with `asset` and `color` properties.
 * @property {function(): void} download - Function to trigger the download of the configured avatar.
 * @property {function(function(): void): void} setDownload - Sets the download function.
 * @property {function(string): void} updateColor - Updates the color for the current category and skin if the category is "Head".
 * @property {function(string): void} updateSkin - Updates the skin color.
 * @property {function(): Promise<void>} fetchCategories - Fetches categories and assets from PocketBase and initializes customization.
 * @property {function(object): void} setCurrentCategory - Sets the current customization category.
 * @property {function(string, object): void} changeAsset - Changes the selected asset for a given category.
 * @property {function(): void} randomize - Randomly selects assets and colors for all categories.
 */
import { create } from "zustand";
import PocketBase from "pocketbase";
import { MeshStandardMaterial } from "three";
import { randInt } from "three/src/math/MathUtils.js";

const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL;
if (!pocketBaseUrl) {
  throw new Error("VITE_POCKETBASE_URL is required");
}

export const PHOTO_POSES = {
  IDLE: "Idle",
  CHILL: "Chill",
  COOL: "Cool",
  PUNCH: "Punch",
  NINJA: "Ninja",
  KING: "King",
  BUSY: "Busy",
};
export const UI_MODES = {
  PHOTO: "photo",
  CUSTOMIZE: "customize",
};

export const pb = new PocketBase(pocketBaseUrl);

export const useConfiguratorStore = create((set, get) => ({
  mode: UI_MODES.CUSTOMIZE,
  setMode: (mode) => {
    set({ mode });
    if (mode === UI_MODES.CUSTOMIZE) {
      set({ pose: PHOTO_POSES.IDLE });
    }
  },

  pose: PHOTO_POSES.IDLE,
  setPose: (pose) => set({ pose }),
  categories: [],
  currentCategory: null,
  assets: [],
  lockedGroups: {},
  skin: new MeshStandardMaterial({ color: 0xf5c6a5, roughness: 1 }),
  customization: {},
  download: () => {},
  // Function to set the download function in the store
  // This allows the Avatar component to set the download function
  setDownload: (download) => set({ download }),

  /**
   * Updates the color for the currently selected customization category.
   * If the current category is "Head", it also updates the skin color.
   * @param {string} color - The new color to apply.
   */
  updateColor: (color) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [state.currentCategory.name]: {
          ...state.customization[state.currentCategory.name],
          color,
        },
      },
    }));
    if (get().currentCategory.name === "Head") {
      get().updateSkin(color);
    }
  },

  // Function to update the skin color
  updateSkin: (color) => {
    get().skin.color.set(color);
  },

  /**
   * Fetches customization categories and assets from the PocketBase backend.
   * It retrieves all "CustomizationGroups" and "CustomizationAssets".
   * For each category, it filters its corresponding assets and initializes
   * its entry in the `customization` state with a default color (the first
   * from its color palette, if available) and a starting asset if specified
   * in the category data.
   * Finally, it updates the store with the fetched categories, assets,
   * the first category as the `currentCategory`, and the initialized
   * `customization` object.
   * @async
   */
  fetchCategories: async () => {
    // you can also fetch all records at once via getFullList
    const categories = await pb.collection("CustomizationGroups").getFullList({
      sort: "+position",
      expand: "colorPalette, cameraPlacement",
    });
    const assets = await pb.collection("CustomizationAssets").getFullList({
      sort: "-created",
    });
    const customization = {};
    categories.forEach((category) => {
      category.assets = assets.filter((asset) => asset.group === category.id);
      customization[category.name] = {
        color: category.expand?.colorPalette?.colors?.[0] || "",
      };
      if (category.startingAsset) {
        customization[category.name].asset = category.assets.find(
          (asset) => asset.id === category.startingAsset
        );
      }
    });

    set({ categories, currentCategory: categories[0], assets, customization });
    get().applyLockedAssets();
  },

  // Function to set the current category
  setCurrentCategory: (category) => set({ currentCategory: category }),

  // Function to change the asset for a specific category
  changeAsset: (category, asset) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [category]: {
          ...state.customization[category],
          asset,
        },
      },
    }));
    get().applyLockedAssets();
  },

  // Function to reset the customization to default values
  randomize: () => {
    const customization = {};
    get().categories.forEach((category) => {
      let randomAsset = category.assets[randInt(0, category.assets.length - 1)];
      if (category.removable) {
        if (randInt(0, category.assets.length - 1) === 0) {
          randomAsset = null;
        }
      }
      const randomColor =
        category.expand?.colorPalette?.colors?.[
          randInt(0, category.expand.colorPalette.colors.length - 1)
        ];
      customization[category.name] = {
        asset: randomAsset,
        color: randomColor,
      };
      if (category.name === "Head") {
        get().updateSkin(randomColor);
      }
    });
    set({ customization });
    get().applyLockedAssets();
  },

  /**
   * Processes the currently selected assets in the `customization` state
   * to determine which other asset groups are "locked" by them.
   *
   * It iterates through each customized category. If an asset in a category
   * has a `lockedGroups` property (an array of category IDs that it locks),
   * this function identifies those locked categories.
   *
   * For each locked category, it records the name of the asset causing the lock
   * and the name of the category to which the locking asset belongs.
   *
   * The result is an object where keys are the names of locked categories,
   * and values are arrays of objects, each specifying a locking asset's name
   * and its original category. This `lockedGroups` object is then updated
   * in the store.
   *
   * This is useful for UI to indicate or disable choices in categories
   * that are implicitly set by another asset (e.g., a full-body suit might
   * lock "Tops" and "Bottoms" categories).
   */
  applyLockedAssets: () => {
    const customization = get().customization;
    const categories = get().categories;
    const lockedGroups = {};

    Object.values(customization).forEach((category) => {
      if (category.asset?.lockedGroups) {
        category.asset.lockedGroups.forEach((group) => {
          const categoryName = categories.find(
            (category) => category.id === group
          ).name;
          if (!lockedGroups[categoryName]) {
            lockedGroups[categoryName] = [];
          }
          const lockingAssetCategoryName = categories.find(
            (cat) => cat.id === category.asset.group
          ).name;
          lockedGroups[categoryName].push({
            name: category.asset.name,
            categoryName: lockingAssetCategoryName,
          });
        });
      }
    });

    set({ lockedGroups });
  },
}));
