// src/components/test-mp/cortarId.ts

export function cortarId(id: string) {
  return id.slice(0, 8) + "...";
}