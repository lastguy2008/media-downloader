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

    // Call Cobalt v10 endpoint API
    const apiResponse = await fetch("https://api.cobalt.tools/", {
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

    const data = await apiResponse.json();

    if (!apiResponse.ok || data.status === "error") {
      return NextResponse.json(
        { error: data.text || data.error?.code || "Failed to process link. Platform might be unsupported or private." },
        { status: 400 }
      );
    }

    // Handle v10 response types (redirect, streamer, or picker for multi-media)
    const downloadLink = data.url || data.picker?.[0]?.url;

    if (!downloadLink && !data.picker) {
      return NextResponse.json(
        { error: "No download URL returned for this media item." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadLink,
      picker: data.picker || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server internal error. Please try again later." },
      { status: 500 }
    );
  }
}