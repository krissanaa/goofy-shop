import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { ok, withApiHandler } from "@/lib/server/response";
import { writeAuditLog } from "@/lib/server/services/audit";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireRole(request, ["ADMIN"]);
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    throw new ApiError(400, "INVALID_REQUEST", "CSV file is required as multipart field `file`.");
  }

  const csvText = await file.text();
  const rows = csvText.split(/\r?\n/).filter((row) => row.trim().length > 0);
  const dryRun = form.get("dryRun") === "true";

  // This endpoint is scaffolded. Replace with streaming CSV parser + transactional upsert logic.
  const result = {
    dryRun,
    processed: Math.max(0, rows.length - 1),
    createdProducts: 0,
    createdVariants: 0,
    errors: [
      {
        code: "NOT_IMPLEMENTED",
        message: "Bulk import parser is scaffolded but not yet wired to create records.",
      },
    ],
  };

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.IMPORT_CSV,
    entityType: "CSVImport",
    entityId: crypto.randomUUID(),
    after: result,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(result);
});
