// screenshots are fetched by scripts/fetch-previews.ts and optimized to webp
const getPreviewUrl = (item: { slug: string }): string =>
  `/images/previews/${item.slug}.webp`;

export default getPreviewUrl;
