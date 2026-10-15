import { expect, test } from "vitest";
import type { ContentRepository } from "emdash";
import type { CreateContentInput, UpdateContentInput } from "emdash";
import { upsertVehicle } from "../src/save-vehicle";

test("a draft is saved unpublished with the WordPress date", async () => {
  const created: CreateContentInput[] = [];
  const repo = {
    async findBySlug() {
      return undefined;
    },
    async create(input: CreateContentInput) {
      created.push(input);
    },
    async update() {
      throw new Error("a new vehicle is created");
    },
  };

  await upsertVehicle(repo as unknown as ContentRepository, {
    id: "2688",
    slug: "2688",
    title: "Volvo V60 T5",
    draft: true,
    publishedAt: "2025-09-17T10:00:00.000Z",
  });

  expect(created[0]?.status).toBe("draft");
  expect(created[0]?.publishedAt).toBe("2025-09-17T10:00:00.000Z");
});

test("saving an existing vehicle keeps the WordPress date", async () => {
  const updated: UpdateContentInput[] = [];
  const repo = {
    async findBySlug() {
      return { id: "existing" };
    },
    async create() {
      throw new Error("an existing vehicle is updated");
    },
    async update(_type: string, _id: string, input: UpdateContentInput) {
      updated.push(input);
    },
  };

  await upsertVehicle(repo as unknown as ContentRepository, {
    id: "2688",
    slug: "2688",
    publishedAt: "2025-09-17T10:00:00.000Z",
  });

  expect(updated[0]?.status).toBe("published");
  expect(updated[0]?.publishedAt).toBe("2025-09-17T10:00:00.000Z");
});
