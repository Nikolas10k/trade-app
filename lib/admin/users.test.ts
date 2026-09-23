import { describe, expect, it, vi } from "vitest";
import { listAllAuthUsers } from "./users";
import type { createAdminClient } from "@/lib/db/supabase-admin";

type FakeUser = { id: string };

function fakeAdminClient(pages: FakeUser[][]) {
  const listUsers = vi.fn(async ({ page }: { page: number; perPage: number }) => {
    const users = pages[page - 1] ?? [];
    const hasNextPage = page < pages.length;
    return { data: { users, nextPage: hasNextPage ? page + 1 : null, lastPage: pages.length }, error: null };
  });
  return { admin: { auth: { admin: { listUsers } } } as unknown as ReturnType<typeof createAdminClient>, listUsers };
}

describe("listAllAuthUsers", () => {
  it("retorna vazio quando não há nenhum usuário", async () => {
    const { admin } = fakeAdminClient([[]]);
    expect(await listAllAuthUsers(admin)).toEqual([]);
  });

  it("retorna todos os usuários de uma única página", async () => {
    const { admin, listUsers } = fakeAdminClient([[{ id: "u1" }, { id: "u2" }]]);
    const users = await listAllAuthUsers(admin);
    expect(users).toEqual([{ id: "u1" }, { id: "u2" }]);
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it("segue nextPage e acumula usuários de várias páginas, na ordem", async () => {
    const { admin, listUsers } = fakeAdminClient([[{ id: "u1" }, { id: "u2" }], [{ id: "u3" }], [{ id: "u4" }]]);
    const users = await listAllAuthUsers(admin);
    expect(users).toEqual([{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }]);
    expect(listUsers).toHaveBeenCalledTimes(3);
    expect(listUsers).toHaveBeenNthCalledWith(1, { page: 1, perPage: 200 });
    expect(listUsers).toHaveBeenNthCalledWith(2, { page: 2, perPage: 200 });
    expect(listUsers).toHaveBeenNthCalledWith(3, { page: 3, perPage: 200 });
  });

  it("propaga erro da API sem engolir nem continuar paginando", async () => {
    const listUsers = vi.fn(async () => ({
      data: { users: [] },
      error: new Error("falha na Auth Admin API"),
    }));
    const admin = { auth: { admin: { listUsers } } } as unknown as ReturnType<typeof createAdminClient>;
    await expect(listAllAuthUsers(admin)).rejects.toThrow("falha na Auth Admin API");
    expect(listUsers).toHaveBeenCalledTimes(1);
  });
});
