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

    const apiResponse = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        videoQuality: "max",
        youtubeVideoCodec: "h264",
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok || data.status === "error") {
      return NextResponse.json(
        { error: data.text || "Failed to process link. Platform might be unsupported or private." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      downloadUrl: data.url,
      picker: data.picker || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server internal error. Please try again later." },
      { status: 500 }
    );
  }
}