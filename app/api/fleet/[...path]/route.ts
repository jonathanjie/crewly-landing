import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  process.env.FLEET_API_INTERNAL ??
  process.env.NEXT_PUBLIC_FLEET_API_BASE ??
  "https://fleet.marinachain.io";

/** Only allow proxying to /api/ and /oauth/ paths on the upstream. */
const ALLOWED_PREFIXES = ["api/", "oauth/"];

async function proxy(req: NextRequest, path: string[]) {
  // H5: Require authorization header — reject unauthenticated requests
  const auth = req.headers.get("authorization");
  if (!auth) {
    return NextResponse.json(
      { detail: "Authorization header required" },
      { status: 401 },
    );
  }

  // C1: Reject path segments that could escape the upstream origin
  const joined = path.join("/");
  if (
    path.some((seg) => seg === ".." || seg === "." || seg.includes("\\")) ||
    joined.includes("//") ||
    !ALLOWED_PREFIXES.some((prefix) => joined.startsWith(prefix))
  ) {
    return NextResponse.json(
      { detail: "Invalid proxy path" },
      { status: 400 },
    );
  }

  const url = `${UPSTREAM}/${joined}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    Authorization: auth,
  };

  const init: RequestInit = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method)) {
    const body = await req.text();
    if (body) init.body = body;
  }

  try {
    const upstream = await fetch(url, init);
    const data = await upstream.text();

    // C3: Build safe response headers — only forward Content-Type and Location
    const responseHeaders: Record<string, string> = {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    };
    const location = upstream.headers.get("location");
    if (location && upstream.status >= 300 && upstream.status < 400) {
      responseHeaders["Location"] = location;
    }

    return new NextResponse(data, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    // C2: Do not leak internal error details — log server-side, return generic message
    console.error("[fleet-proxy] upstream fetch failed for", req.method, joined);
    return NextResponse.json(
      { detail: "Upstream service unavailable" },
      { status: 502 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await params).path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await params).path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await params).path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(req, (await params).path);
}
