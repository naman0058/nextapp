export function isBlogDbEnabled(): boolean {
  const uri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  return Boolean(uri && dbName);
}
