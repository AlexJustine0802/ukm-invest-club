import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminActor } from "@/lib/adminAccess";
import { getUserSession } from "@/lib/userAuth";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

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

  // Both admin CMS users and signed-in members can upload images.
  const [admin, member] = await Promise.all([getAdminActor(), getUserSession()]);
  if (!admin && !member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        allowedContentTypes: ["image/*"],
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
