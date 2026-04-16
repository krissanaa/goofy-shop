export const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error("Prisma is not configured in this project.")
    },
  },
) as Record<string, unknown>
