import { NextResponse } from "next/server";

const BANXICO_URL =
  "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43936/datos/oportuno";

type BanxicoOportunoResponse = {
  bmx?: {
    series?: Array<{
      datos?: Array<{ fecha?: string; dato?: string }>;
    }>;
  };
};

function parseBanxicoDateToIso(fecha: string): string | null {
  const parts = fecha.trim().split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => Number.parseInt(p, 10));
  if (!yyyy || !mm || !dd) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const token = process.env.BANXICO_TOKEN;
  if (!token?.trim()) {
    return NextResponse.json(
      { error: "missing_banxico_token" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(BANXICO_URL, {
      headers: { "Bmx-Token": token.trim() },
      next: { revalidate: 86_400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "banxico_http", status: res.status },
        { status: 502 },
      );
    }

    const json = (await res.json()) as BanxicoOportunoResponse;
    const raw = json.bmx?.series?.[0]?.datos?.[0];
    const dato = raw?.dato?.trim();
    const fecha = raw?.fecha?.trim();

    if (!dato || !fecha) {
      return NextResponse.json(
        { error: "banxico_empty" },
        { status: 502 },
      );
    }

    const rate = Number.parseFloat(dato.replace(",", "."));
    if (Number.isNaN(rate)) {
      return NextResponse.json(
        { error: "banxico_parse" },
        { status: 502 },
      );
    }

    const iso = parseBanxicoDateToIso(fecha);
    if (!iso) {
      return NextResponse.json(
        { error: "banxico_date" },
        { status: 502 },
      );
    }

    return NextResponse.json({ rate, date: iso });
  } catch (e) {
    console.error("GET /api/cetes:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
