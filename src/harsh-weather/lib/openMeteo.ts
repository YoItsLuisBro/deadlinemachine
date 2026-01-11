export type GeoPick = {
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
};

export type WeatherBundle = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  } | null;
  daily: Array<{
    date: string; // YYYY-MM-DD
    tmax: number;
    tmin: number;
    precip_probability_max: number;
    precip_sum: number;
    uv_index_max: number;
    wind_speed_10m_max: number;
    weather_code: number;
  }>;
};

type GeoResponse = {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    admin1?: string;
  }>;
};

export async function searchLocation(name: string): Promise<GeoPick[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding error ${res.status}`);
  const json = (await res.json()) as GeoResponse;

  const out = (json.results ?? []).map((r) => ({
    name: r.name,
    country: r.country_code ?? "",
    admin1: r.admin1 ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));

  return out;
}

type ForecastResponse = {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    uv_index_max: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
  };
};

export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WeatherBundle> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(",")
  );

  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "uv_index_max",
      "wind_speed_10m_max",
      "weather_code",
    ].join(",")
  );

  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "6");

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Forecast error ${res.status}`);

  const json = (await res.json()) as ForecastResponse;

  const daily = json.daily;
  const days: WeatherBundle["daily"] = [];

  if (daily?.time?.length) {
    for (let i = 0; i < daily.time.length; i++) {
      days.push({
        date: daily.time[i],
        tmax: daily.temperature_2m_max[i],
        tmin: daily.temperature_2m_min[i],
        precip_probability_max: daily.precipitation_probability_max[i] ?? 0,
        precip_sum: daily.precipitation_sum[i] ?? 0,
        uv_index_max: daily.uv_index_max[i] ?? 0,
        wind_speed_10m_max: daily.wind_speed_10m_max[i] ?? 0,
        weather_code: daily.weather_code[i] ?? 0,
      });
    }
  }

  return {
    current: json.current ?? null,
    daily: days,
  };
}
