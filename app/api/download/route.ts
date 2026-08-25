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

    // Call RapidAPI Facebook Reel and Video Downloader Endpoint
    const targetApiUrl = `https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php?url=${encodeURIComponent(url)}`;

    const response = await fetch(targetApiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "f15b2d3970mshe6a22fcb096bfe8p194187jsn5399724946a7",
        "x-rapidapi-host": "facebook-reel-and-video-downloader.p.rapidapi.com",
      },
    });

    const data = await response.json();

    if (!response.ok || !data) {
      return NextResponse.json(
        { error: data?.message || "Failed to process video link." },
        { status: 400 }
      );
    }

    // Map response structure from RapidAPI
    const downloadLink = data.sd || data.hd || data.url || data.links?.sd || data.links?.hd;

    if (!downloadLink) {
      return NextResponse.json(
        { error: "No direct media link found for this URL." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadLink,
      picker: null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server internal error. Please try again later." },
      { status: 500 }
    );
  }
}