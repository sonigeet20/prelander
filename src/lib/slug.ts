export function slugify(input: string, maxLength = 32): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, maxLength);
  return slug;
}
