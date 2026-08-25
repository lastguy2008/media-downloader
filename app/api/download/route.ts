import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid media URL." },
        { status: 400 }
      );
    }

    // Direct fetch to open media resolver endpoints bypassing JWT checks
    const apiTarget = "https://co.wuk.sh/api/json";

    const response = await fetch(apiTarget, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      body: JSON.stringify({
        url: url,
        vQuality: "720",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status === "error") {
      return NextResponse.json(
        { error: data.text || "Failed to process video link. The video might be private or region-restricted." },
        { status: 400 }
      );
    }

    const downloadUrl = data.url || data.picker?.[0]?.url;

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "No direct download link returned for this URL." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadUrl,
      picker: data.picker || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error processing media link." },
      { status: 500 }
    );
  }
}