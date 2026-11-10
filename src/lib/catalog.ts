import { products } from "./data/products";
import type { Product, Variant } from "./types";

/**
 * Catalogue access. Everything reads through these functions so the sample
 * data can be replaced by database queries without touching the pages.
 */
export const listProducts = (): Product[] => products.filter((p) => !p.isAddon);
export const listAddons = (): Product[] => products.filter((p) => p.isAddon);
export const listFeatured = (): Product[] => listProducts().filter((p) => p.featured);
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getVariant = (product: Product, variantId: string): Variant | undefined =>
  product.variants.find((v) => v.id === variantId);
export const fromPrice = (product: Product) =>
  Math.min(...product.variants.map((v) => v.price));
