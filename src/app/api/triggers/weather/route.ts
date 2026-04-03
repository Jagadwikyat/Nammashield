import { NextRequest, NextResponse } from "next/server";
import { checkWeatherAndMaybeInsert } from "@/lib/triggers/weatherCheck";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  const zone = req.nextUrl.searchParams.get("zone");
  if (!city || !zone) {
    return NextResponse.json(
      { error: "city and zone query params required" },
      { status: 400 }
    );
  }

  const result = await checkWeatherAndMaybeInsert(city, zone);

  if (result.reason === "missing_api_key") {
    return NextResponse.json(
      { error: "OPENWEATHERMAP_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!result.triggered) {
    return NextResponse.json(null);
  }

  return NextResponse.json(result.trigger);
}
