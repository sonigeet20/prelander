import { describe, it } from "node:test";
import assert from "node:assert";
import { slugify } from "../src/lib/slug";

describe("slugify", () => {
  it("creates safe subdomain slugs", () => {
    assert.strictEqual(slugify("My Offer Name"), "my-offer-name");
  });

  it("trims length", () => {
    const slug = slugify("a".repeat(100), 10);
    assert.strictEqual(slug.length, 10);
  });

  it("removes invalid characters", () => {
    assert.strictEqual(slugify("Offer!!! 2025"), "offer-2025");
  });
});
