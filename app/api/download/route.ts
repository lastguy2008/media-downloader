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

    // List of open public instances running cobalt engine without JWT requirement
    const instances = [
      "https://cobalt-api.ayo.tf/",
      "https://co.meow.gb.net/",
      "https://cobalt-api.kwiatekmonster.tokyo/",
    ];

    let mediaData: any = null;
    let lastError = "";

    // Iterate through instances until one returns a successful payload
    for (const instance of instances) {
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
        { error: lastError || "Failed to process link. The video may be private or protected." },
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