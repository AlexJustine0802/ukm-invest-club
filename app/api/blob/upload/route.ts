import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminActor } from "@/lib/adminAccess";
import { getUserSession } from "@/lib/userAuth";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";
import { prisma } from "@/lib/prisma";
import { allowsGuests, formStatus } from "@/lib/forms";

/**
 * Issues short-lived Vercel Blob client-upload tokens. The image itself never
 * passes through this route, which avoids Vercel Function's 4.5 MB request
 * limit and lets the UI enforce the full 5 MB limit.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  // Vercel sends this server-to-server callback after the blob is complete.
  // There is no database work to do here, so acknowledge it without a user
  // cookie; the token-generation request below still requires authentication.
  if (body.type === "blob.upload-completed") {
    return NextResponse.json({ ok: true });
  }

  const clientPayload =
    typeof body.payload?.clientPayload === "string"
      ? body.payload.clientPayload
      : null;
  let publicFormUpload = false;
  if (clientPayload) {
    try {
      const parsed = JSON.parse(clientPayload) as { formId?: string };
      if (parsed.formId) {
        const form = await prisma.registrationForm.findUnique({
          where: { id: parsed.formId },
          select: {
            audience: true,
            published: true,
            registrationEnabled: true,
            opensAt: true,
            closesAt: true,
          },
        });
        publicFormUpload = Boolean(
          form &&
            allowsGuests(form.audience) &&
            form.published &&
            form.registrationEnabled &&
            formStatus(form, new Date()) === "open",
        );
      }
    } catch {
      publicFormUpload = false;
    }
  }

  // Admins and signed-in members can upload; public registration uploads are
  // allowed only for a currently open public form.
  const [admin, member] = await Promise.all([getAdminActor(), getUserSession()]);
  if (!admin && !member && !publicFormUpload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!process.env.BLOB_NEW_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Blob upload is not configured" },
        { status: 503 },
      );
    }
    const jsonResponse = await handleUpload({
      token: process.env.BLOB_NEW_READ_WRITE_TOKEN,
      request,
      body,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        allowedContentTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "application/pdf",
          "application/zip",
          "application/x-zip-compressed",
          "text/csv",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
      }),
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[blob upload] failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}
