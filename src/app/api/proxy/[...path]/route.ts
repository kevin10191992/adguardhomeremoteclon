import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADGUARD_URL = process.env.ADGUARD_URL || "";
const DEFAULT_ADGUARD_USER = process.env.ADGUARD_USERNAME || "";
const DEFAULT_ADGUARD_PASS = process.env.ADGUARD_PASSWORD || "";

function getTargetConfig(req: NextRequest) {
  let targetUrl = req.headers.get("x-adguard-url") || DEFAULT_ADGUARD_URL;
  targetUrl = targetUrl.replace(/\/+$/, "");

  let authHeader = req.headers.get("x-adguard-auth");
  if (!authHeader && DEFAULT_ADGUARD_USER && DEFAULT_ADGUARD_PASS) {
    const creds = Buffer.from(`${DEFAULT_ADGUARD_USER}:${DEFAULT_ADGUARD_PASS}`).toString("base64");
    authHeader = `Basic ${creds}`;
  } else if (authHeader && !authHeader.startsWith("Basic ")) {
    authHeader = `Basic ${authHeader}`;
  }

  return { targetUrl, authHeader: authHeader || "" };
}

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const { targetUrl, authHeader } = getTargetConfig(req);

  if (!targetUrl) {
    return NextResponse.json(
      {
        error: "Servidor no configurado",
        message: "Por favor, introduce la URL de tu servidor AdGuard Home en Ajustes o define la variable de entorno ADGUARD_URL.",
      },
      { status: 400 }
    );
  }

  const subPath = path.join("/");
  const search = req.nextUrl.search;
  const destination = `${targetUrl}/${subPath}${search}`;

  const headers: Record<string, string> = {};
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(destination, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseText = await res.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      return NextResponse.json(responseData, {
        status: res.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("content-type") || "text/plain",
        },
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        error: "Error de conexión con AdGuard Home",
        message: error.message || "No se pudo alcanzar la instancia de AdGuard Home",
        target: destination,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}
