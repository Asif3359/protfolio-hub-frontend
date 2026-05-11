import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL ?? 'https://protfolio-hub-backend.onrender.com/api';

const FORWARDED_HEADERS = ['authorization', 'content-type', 'accept', 'cache-control'];

function buildBackendUrl(path: string[], search: string): string {
    const joined = path.join('/');
    return `${BACKEND_BASE}/${joined}${search}`;
}

function pickHeaders(req: NextRequest): HeadersInit {
    const headers: Record<string, string> = {};
    for (const key of FORWARDED_HEADERS) {
        const val = req.headers.get(key);
        if (val) headers[key] = val;
    }
    return headers;
}

async function proxyRequest(req: NextRequest, path: string[]): Promise<NextResponse> {
    const url = buildBackendUrl(path, req.nextUrl.search);

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const body = hasBody ? await req.arrayBuffer() : undefined;

    try {
        const backendRes = await fetch(url, {
            method: req.method,
            headers: pickHeaders(req),
            body: body ? Buffer.from(body) : undefined,
        });

        const data = await backendRes.arrayBuffer();

        return new NextResponse(data, {
            status: backendRes.status,
            headers: {
                'content-type': backendRes.headers.get('content-type') ?? 'application/json',
            },
        });
    } catch (err) {
        console.error('[Proxy] Error forwarding to backend:');
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return proxyRequest(req, path);
}
