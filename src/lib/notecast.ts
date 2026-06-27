import type { AttributeValue } from "@aws-sdk/client-dynamodb";

export type DynamoItem = Record<string, AttributeValue>;

export function getString(item: DynamoItem, key: string, fallback = "") {
  const value = item[key];
  return value && "S" in value ? value.S ?? fallback : fallback;
}

export function getNumber(item: DynamoItem, key: string, fallback = 0) {
  const value = item[key];
  if (!value || !("N" in value) || value.N === undefined) return fallback;
  const parsed = Number(value.N);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getStringSet(item: DynamoItem, key: string) {
  const value = item[key];
  return value && "SS" in value ? value.SS ?? [] : [];
}

export function getCreatedTime(item: DynamoItem) {
  const createdAt = getString(item, "createdAt");
  const time = createdAt ? new Date(createdAt).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function getStorageKey(item: DynamoItem, user: string | null) {
  const explicitKey = getString(item, "storageKey");
  if (explicitKey) return explicitKey;

  const fileId = getString(item, "fileId");
  return user && fileId ? `private/${user}/notes/${fileId}.txt` : "";
}

export function formatBytes(bytes: number) {
  if (!bytes) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function getDocumentSearchText(item: DynamoItem) {
  return [
    getString(item, "fileName"),
    getString(item, "fileNameActual"),
    getString(item, "category"),
    getString(item, "fileType"),
    getString(item, "summary"),
    getString(item, "contentPreview"),
    getString(item, "extractedText"),
    ...getStringSet(item, "tags"),
  ]
    .join(" ")
    .toLowerCase();
}

export function buildLocalTags(item: DynamoItem) {
  const storedTags = getStringSet(item, "tags");
  const category = getString(item, "category");
  const type = getString(item, "fileType");
  return Array.from(new Set([...storedTags, category, type].filter(Boolean)));
}

