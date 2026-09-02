import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";

/**
 * Creates secure Vercel Blob client-upload tokens for registration files.
 * The file itself never passes through the Vercel Function, avoiding the
 * platform's 4.5 MB Function request-body limit.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let formId: string | undefined;
        try {
          const payload = JSON.parse(clientPayload ?? "{}") as { formId?: unknown };
          if (typeof payload.formId === "string") formId = payload.formId;
        } catch {
          // A malformed payload is rejected below.
        }

        if (!formId) throw new Error("A registration form is required.");
        const form = await prisma.registrationForm.findUnique({
          where: { id: formId },
          select: { id: true },
        });
        if (!form) throw new Error("Registration form not found.");

        return {
          access: "public",
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          tokenPayload: JSON.stringify({ formId }),
        };
      },
      onUploadCompleted: async () => {
        // The registration Server Action stores the returned URL with the
        // response. No database write is needed at Blob callback time.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
