// lib/cache.ts
import { unstable_cache } from "next/cache";

export async function getCachedData<T>(
  keyParts: string[],
  tags: string[],
  fetcher: () => Promise<T>,
  revalidate: number = 300
): Promise<T> {
  const cachedFn = unstable_cache(
    async () => {
      return await fetcher();
    },
    keyParts,
    { tags, revalidate }
  );

  const data = await cachedFn();
  return data;
}