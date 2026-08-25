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

    // List of active public instances that do not require JWT authorization tokens
    const instances = [
      "https://cobalt-api.kwiatekmonster.tokyo/",
      "https://api.cobalt.tools/",
    ];

    let responseData: any = null;
    let errorMessage = "";

    for (const instance of instances) {
      try {
        const headers: Record<string, string> = {
          "Accept": "application/json",
          "Content-Type": "application/json",
        };

        // Attach API Key if configured in Vercel Environment Variables
        if (process.env.COBALT_API_KEY) {
          headers["Authorization"] = `Api-Key ${process.env.COBALT_API_KEY}`;
        }

        const res = await fetch(instance, {
          method: "POST",
          headers,
          body: JSON.stringify({
            url: url,
            videoQuality: "max",
          }),
        });

        const data = await res.json();

        if (res.ok && data.status !== "error") {
          responseData = data;
          break;
        } else {
          errorMessage = data.text || data.error?.code || "Unable to parse link";
        }
      } catch (err) {
        continue;
      }
    }

    if (!responseData) {
      return NextResponse.json(
        { error: errorMessage || "Failed to process link. The video may be private or restricted." },
        { status: 400 }
      );
    }

    const downloadUrl = responseData.url || responseData.picker?.[0]?.url;

    return NextResponse.json({
      status: "success",
      downloadUrl: downloadUrl,
      picker: responseData.picker || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}