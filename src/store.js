import { create } from "zustand";
import PocketBase from "pocketbase";

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;
if (!pocketbaseUrl) {
  throw new Error("VITE_POCKETBASE_URL is not defined");
}

const pb = new PocketBase(pocketbaseUrl);

const useConfiguratorStore = create((set) => ({
  // State
  categories: [],
  currentCategory: null,
  assets: [],
  fetchCategories: async () => {
    const categories = await pb.collection("categories").getFullList({
      sort: "+position",
    });
    const assets = await pb.collection("assets").getFullList({
      sort: "-created",
    });
    set({ categories, currentCategory: categories[0], assets });
  },
  setCurrentCategory: (category) => {
    set({ currentCategory: category });
  },
}));

export default useConfiguratorStore;
