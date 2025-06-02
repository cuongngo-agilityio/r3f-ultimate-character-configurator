/**
 * @file UI.jsx
 * @description This file contains the UI components for the character configurator.
 * It includes components for displaying asset categories, assets, color pickers,
 * and action buttons like randomize and download.
 */

import { useEffect } from "react";
import { pb, PHOTO_POSES, UI_MODES, useConfiguratorStore } from "../store";

const PosesBox = () => {
  const curPose = useConfiguratorStore((state) => state.pose);
  const setPose = useConfiguratorStore((state) => state.setPose);
  return (
    <div className="pointer-events-auto rounded-t-lg bg-gradient-to-br from-black/30 to-indigo-900/20  backdrop-blur-sm drop-shadow-md flex p-6 gap-3">
      {Object.keys(PHOTO_POSES).map((pose) => (
        <button
          className={`transition-colors duration-200 font-medium flex-shrink-0 border-b ${
            curPose === PHOTO_POSES[pose]
              ? "text-white shadow-purple-100 border-b-white"
              : "text-gray-200 hover:text-gray-100 border-b-transparent"
          }
       `}
          onClick={() => setPose(PHOTO_POSES[pose])}
        >
          {pose}
        </button>
      ))}
    </div>
  );
};

/**
 * `AssetsBox` component displays the categories and assets for customization.
 * It fetches categories on mount and allows users to select a category and then an asset within that category.
 * It also provides an option to remove an asset if the category allows it.
 *
 * @component
 * @returns {JSX.Element} The AssetsBox component.
 */
const AssetsBox = () => {
  const {
    categories,
    currentCategory,
    fetchCategories,
    setCurrentCategory,
    changeAsset,
    customization,
    lockedGroups,
  } = useConfiguratorStore();

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <div className="rounded-t-lg bg-gradient-to-br from-black/30 to-indigo-900/20  backdrop-blur-sm drop-shadow-md flex flex-col py-6 gap-3 overflow-hidden ">
      <div className="flex items-center gap-8 pointer-events-auto overflow-x-auto noscrollbar px-6 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCurrentCategory(category)}
            className={`transition-colors duration-200 font-medium flex-shrink-0 border-b ${
              currentCategory.name === category.name
                ? "text-white shadow-purple-100 border-b-white"
                : "text-gray-400 hover:text-gray-500 border-b-transparent"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      {lockedGroups[currentCategory?.name] && (
        <p className="text-red-400 px-6">
          Asset is hidden by{" "}
          {lockedGroups[currentCategory.name]
            .map((asset) => `${asset.name} (${asset.categoryName})`)
            .join(", ")}
        </p>
      )}

      <div className="flex gap-2 flex-wrap px-6">
        {currentCategory?.removable && (
          <button
            onClick={() => changeAsset(currentCategory.name, null)}
            className={`w-20 h-20 rounded-xl overflow-hidden pointer-events-auto hover:opacity-100 transition-all border-2 duration-300
              bg-gradient-to-tr from-black to-gray-800
              ${
                !customization[currentCategory.name].asset
                  ? "border-white opacity-100"
                  : "opacity-80 border-black"
              }`}
          >
            <div className="w-full h-full flex items-center justify-center bg-black/40 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>
        )}
        {currentCategory?.assets.map((asset) => (
          <button
            key={asset.thumbnail}
            onClick={() => changeAsset(currentCategory.name, asset)}
            className={`w-20 h-20 rounded-xl overflow-hidden pointer-events-auto hover:opacity-100 transition-all border-2 duration-300
              ${
                customization[currentCategory.name]?.asset?.id === asset.id
                  ? "border-white opacity-100"
                  : "opacity-80 border-transparent"
              }`}
          >
            <img
              className="object-cover w-full h-full"
              src={pb.files.getURL(asset, asset.thumbnail)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * `RandomizeButton` component provides a button to randomize the character's appearance.
 * It uses the `randomize` function from the `useConfiguratorStore`.
 *
 * @component
 * @returns {JSX.Element} The RandomizeButton component.
 */
const RandomizeButton = () => {
  const randomize = useConfiguratorStore((state) => state.randomize);
  return (
    <button
      className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-white font-medium px-4 py-3 pointer-events-auto drop-shadow-md"
      onClick={randomize}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    </button>
  );
};

/**
 * `DownloadButton` component provides a button to trigger the download of the current character configuration.
 * It uses the `download` function from the `useConfiguratorStore`.
 *
 * @component
 * @returns {JSX.Element} The DownloadButton component.
 */
const DownloadButton = () => {
  const download = useConfiguratorStore((state) => state.download);
  return (
    <button
      className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-white font-medium px-4 py-3 pointer-events-auto drop-shadow-md"
      onClick={download}
    >
      Download
    </button>
  );
};

/**
 * `UI` is the main component that orchestrates the user interface of the configurator.
 * It displays a header with a logo and action buttons (Randomize, Download),
 * and a footer area for asset selection (`AssetsBox`) and color picking (`ColorPicker`).
 *
 * @component
 * @returns {JSX.Element} The main UI component.
 */
export const UI = () => {
  const currentCategory = useConfiguratorStore(
    (state) => state.currentCategory
  );
  const customization = useConfiguratorStore((state) => state.customization);
  const mode = useConfiguratorStore((state) => state.mode);
  const setMode = useConfiguratorStore((state) => state.setMode);

  return (
    <main className="pointer-events-none fixed z-10 inset-0 select-none">
      <div className="mx-auto h-full max-w-screen-xl w-full flex flex-col justify-between">
        <div className="flex justify-between items-center p-10">
          <a
            className="pointer-events-auto"
            href="https://lessons.wawasensei.dev/courses/react-three-fiber"
          >
            <img className="w-20" src="/images/wawasensei-white.png" />
          </a>
          <div className="flex items-cente gap-2">
            <RandomizeButton />
            {/* <ScreenshotButton /> */}
            <DownloadButton />
          </div>
        </div>
        <div className="px-10 flex flex-col">
          {mode === UI_MODES.CUSTOMIZE && (
            <>
              {currentCategory?.colorPalette &&
                customization[currentCategory.name] && <ColorPicker />}
              <AssetsBox />
            </>
          )}
          {mode === UI_MODES.PHOTO && <PosesBox />}
          <div className="flex justify-stretch">
            <button
              className={`flex-1 pointer-events-auto  p-4 text-white transition-colors duration-200 font-medium
                ${
                  mode === UI_MODES.CUSTOMIZE
                    ? "bg-indigo-500/90"
                    : "bg-indigo-500/30 hover:bg-indigo-500/50"
                }
              `}
              onClick={() => setMode(UI_MODES.CUSTOMIZE)}
            >
              Customize avatar
            </button>
            <div className="w-px bg-white/30"></div>
            <button
              className={`flex-1 pointer-events-auto p-4 text-white transition-colors duration-200 font-medium
                ${
                  mode === UI_MODES.PHOTO
                    ? "bg-indigo-500/90"
                    : "bg-indigo-500/30 hover:bg-indigo-500/50"
                }
                `}
              onClick={() => setMode(UI_MODES.PHOTO)}
            >
              Photo booth
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

/**
 * `ColorPicker` component displays a list of available colors for the currently selected asset,
 * if the asset category supports color customization and an asset is selected.
 * Users can click on a color to update the asset's color.
 *
 * @component
 * @returns {JSX.Element | null} The ColorPicker component, or null if no asset is selected or the category doesn't support colors.
 */
const ColorPicker = () => {
  const updateColor = useConfiguratorStore((state) => state.updateColor);
  const currentCategory = useConfiguratorStore(
    (state) => state.currentCategory
  );
  const handleColorChange = (color) => {
    updateColor(color);
  };
  const customization = useConfiguratorStore((state) => state.customization);

  if (!customization[currentCategory.name]?.asset) {
    return null;
  }

  /**
   * Renders a scrollable row of color swatches.
   * Each swatch is a button that, when clicked, updates the color for the current category.
   * The currently selected color swatch has a white border.
   */
  return (
    <div className="pointer-events-auto relative flex gap-2 max-w-full overflow-x-auto backdrop-blur-sm py-2 drop-shadow-md">
      {currentCategory.expand?.colorPalette?.colors.map((color, index) => (
        <button
          key={`${index}-${color}`}
          className={`w-10 h-10 p-1.5 drop-shadow-md bg-black/20 shrink-0 rounded-lg overflow-hidden transition-all duration-300 border-2
             ${
               customization[currentCategory.name].color === color
                 ? "border-white"
                 : "border-transparent"
             }
          `}
          onClick={() => handleColorChange(color)}
        >
          <div
            className="w-full h-full rounded-md"
            style={{ backgroundColor: color }}
          />
        </button>
      ))}
    </div>
  );
};
