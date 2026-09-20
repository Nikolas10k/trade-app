import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { exportUserData, tradesToCsv } from "@/lib/lgpd/export";

/**
 * Exportação de dados (LGPD, Art. 18 — portabilidade). Só o próprio usuário
 * exporta os próprios dados — RLS de dono garante isso, nenhum parâmetro de
 * usuário é aceito na requisição.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";
  const data = await exportUserData(supabase, user.id);
  const datePart = data.exportedAt.slice(0, 10);

  if (format === "csv") {
    return new NextResponse(tradesToCsv(data.trades), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="trades-${datePart}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-${datePart}.json"`,
    },
  });
}
