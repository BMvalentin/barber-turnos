"use client";

import { useState } from "react";

export function useSessionId() {
  const [sessionId] = useState(() => crypto.randomUUID());
  return sessionId;
}
