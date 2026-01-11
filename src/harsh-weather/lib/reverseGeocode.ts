export type ReversePlace = {
  name: string; // city/town/etc
  admin1: string; // state/region
  country: string; // country code (e.g. US)
};

type NominatimReverse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    country?: string;
    country_code?: string; // lower-case, e.g. "us"
  };
  display_name?: string;
};

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<ReversePlace> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("zoom", "10"); // city-level detail :contentReference[oaicite:3]{index=3}
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en"); // :contentReference[oaicite:4]{index=4}

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Reverse geocode error ${res.status}`);

  const json = (await res.json()) as NominatimReverse;
  const a = json.address ?? {};

  const name =
    a.city ||
    a.town ||
    a.village ||
    a.hamlet ||
    a.municipality ||
    a.county ||
    "GPS FIX";

  const admin1 = a.state || a.region || "";
  const country = (a.country_code || "").toUpperCase();

  return { name, admin1, country };
}
