/**
 * In-memory strategy store with save/load/share functions.
 * Generates short, URL-safe shareable IDs via base62 encoding.
 */

import type { Node, Edge } from "@xyflow/react";

// ─── Types ───

export interface Strategy {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
}

export interface StrategyMeta {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  edgeCount: number;
}

type StrategyInput = Omit<Strategy, "id" | "createdAt" | "updatedAt">;

// ─── ID Generation ───

const BASE62_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a cryptographically random base62 ID of the given length.
 * Default 12 chars gives ~71 bits of entropy — more than enough to avoid collisions.
 */
export function generateId(length = 12): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < length; i++) {
    id += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
  }
  return id;
}

// ─── In-Memory Store ───

const store = new Map<string, Strategy>();

function now(): number {
  return Date.now();
}

/**
 * Save a strategy. If no `id` is provided a new one is generated.
 * Returns the full saved Strategy including id and timestamps.
 */
export function saveStrategy(input: StrategyInput): Strategy {
  const id = generateId();
  const ts = now();

  const strategy: Strategy = {
    ...input,
    id,
    createdAt: ts,
    updatedAt: ts,
  };

  store.set(id, strategy);
  return strategy;
}

/**
 * Update an existing strategy (partial merge).
 * Bumps `updatedAt`. Returns the updated Strategy or `null` if not found.
 */
export function updateStrategy(
  id: string,
  patch: Partial<Pick<Strategy, "name" | "description" | "nodes" | "edges">>
): Strategy | null {
  const existing = store.get(id);
  if (!existing) return null;

  const updated: Strategy = {
    ...existing,
    ...patch,
    updatedAt: now(),
  };

  store.set(id, updated);
  return updated;
}

/**
 * Load a strategy by id. Returns `null` if not found.
 */
export function loadStrategy(id: string): Strategy | null {
  return store.get(id) ?? null;
}

/**
 * List all saved strategies as lightweight metadata objects.
 */
export function listStrategies(): StrategyMeta[] {
  return Array.from(store.values()).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    nodeCount: s.nodes.length,
    edgeCount: s.edges.length,
  }));
}

/**
 * Delete a strategy by id. Returns `true` if it existed.
 */
export function deleteStrategy(id: string): boolean {
  return store.delete(id);
}

// ─── Share (Base64 encoded) ───

/**
 * Create a shareable encoded string for a strategy.
 * Returns a base64url-encoded string that can be used in query params or URLs.
 */
export function shareStrategy(id: string): string | null {
  const strategy = store.get(id);
  if (!strategy) return null;

  const json = JSON.stringify(strategy);
  const encoded = btoa(unescape(encodeURIComponent(json)));

  // Convert standard base64 to URL-safe base64
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a shared strategy string back into a Strategy object.
 * Does NOT persist it in the store — caller decides whether to save.
 */
export function decodeSharedStrategy(encoded: string): Strategy | null {
  try {
    // Restore standard base64 from URL-safe variant
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Re-add padding
    while (b64.length % 4 !== 0) b64 += "=";

    const json = decodeURIComponent(escape(atob(b64)));
    const strategy = JSON.parse(json) as Strategy;

    // Basic shape validation
    if (
      !strategy.id ||
      !strategy.name ||
      !Array.isArray(strategy.nodes) ||
      !Array.isArray(strategy.edges)
    ) {
      return null;
    }

    return strategy;
  } catch {
    return null;
  }
}

/**
 * Import a shared strategy into the local store (assigns a new id).
 * Returns the newly persisted Strategy.
 */
export function importSharedStrategy(encoded: string): Strategy | null {
  const decoded = decodeSharedStrategy(encoded);
  if (!decoded) return null;

  return saveStrategy({
    name: decoded.name,
    description: decoded.description,
    nodes: decoded.nodes,
    edges: decoded.edges,
  });
}

// ─── Convenience: count / exists ───

export function strategyExists(id: string): boolean {
  return store.has(id);
}

export function strategyCount(): number {
  return store.size;
}
