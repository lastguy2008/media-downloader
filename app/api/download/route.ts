import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    // List of active public instances running cobalt engine
    const apiInstances = [
      "https://cobalt-api.kwiatekmonster.tokyo/",
      "https://api.cobalt.tools/",
    ];

    let mediaData = null;
    let lastError = "";

    // Try primary and fallback instances
    for (const instance of apiInstances) {
      try {
        const response = await fetch(instance, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url,
            videoQuality: "max",
          }),
        });

        const data = await response.json();

        if (response.ok && data.status !== "error") {
          mediaData = data;
          break;
        } else {
          lastError = data.text || data.error?.code || "Extraction failed.";
        }
      } catch (err) {
        continue;
      }
    }

    if (!mediaData) {
      return NextResponse.json(
        { error: lastError || "Failed to process link. The target media may be private or protected." },
        { status: 400 }
      );
    }

    const downloadLink = mediaData.url || mediaData.picker?.[0]?.url;

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadLink,
      picker: mediaData.picker || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server internal error. Please try again later." },
      { status: 500 }
    );
  }
}