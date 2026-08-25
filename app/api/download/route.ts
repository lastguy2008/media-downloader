import { NextRequest, NextResponse } from "next/server";

interface CobaltSuccessResponse {
  status: "redirect" | "stream" | "picker";
  url?: string;
  picker?: Array<{ url: string; type?: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Please provide a valid media URL." },
        { status: 400 }
      );
    }

    // Active open instances running Cobalt v10 engine
    const instances = [
      "https://cobalt-api.ayo.tf/",
      "https://co.meow.gb.net/",
      "https://cobalt-api.kwiatekmonster.tokyo/",
      "https://api.cobalt.tools/",
    ];

    let mediaData: CobaltSuccessResponse | null = null;
    let lastError = "";

    for (const instance of instances) {
      try {
        const response = await fetch(instance, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "v-api": "10",
          },
          body: JSON.stringify({
            url: url,
            videoQuality: "max",
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          lastError = errData?.text || errData?.error?.code || `HTTP ${response.status}`;
          continue;
        }

        const data = await response.json();

        if (data && data.status !== "error") {
          mediaData = data;
          break;
        } else {
          lastError = data?.text || data?.error?.code || "Extraction failed.";
        }
      } catch (err: unknown) {
        // Skip failed instance and try next
        continue;
      }
    }

    if (!mediaData) {
      return NextResponse.json(
        { 
          error: lastError 
            ? `Service error: ${lastError}` 
            : "Failed to extract media. The video might be private, restricted, or unavailable." 
        },
        { status: 400 }
      );
    }

    const downloadLink = mediaData.url || mediaData.picker?.[0]?.url;

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadLink || null,
      picker: mediaData.picker || null,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}