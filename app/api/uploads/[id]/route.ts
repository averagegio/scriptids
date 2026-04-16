import { withApiLinks } from "@/lib/api-meta";
import { promises as fs } from "node:fs";
import path from "node:path";

type UploadRecord = {
  id: string;
  createdAt: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  fileName: string;
};

type UploadIndex = {
  version: 1;
  uploads: UploadRecord[];
};

function dataDir() {
  return path.join(process.cwd(), ".data");
}

function uploadsDir() {
  return path.join(dataDir(), "uploads");
}

function indexPath() {
  return path.join(uploadsDir(), "index.json");
}

async function readIndex(): Promise<UploadIndex> {
  await fs.mkdir(uploadsDir(), { recursive: true });
  try {
    const raw = await fs.readFile(indexPath(), "utf8");
    const parsed = JSON.parse(raw) as UploadIndex;
    if (parsed?.version === 1 && Array.isArray(parsed.uploads)) return parsed;
  } catch {
    // ignore
  }
  return { version: 1, uploads: [] };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idx = await readIndex();
  const rec = idx.uploads.find((u) => u.id === id);
  if (!rec) return Response.json(withApiLinks({ error: "Not found" }), { status: 404 });

  const filePath = path.join(uploadsDir(), rec.fileName);
  try {
    const buf = await fs.readFile(filePath);
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": rec.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return Response.json(withApiLinks({ error: "Not found" }), { status: 404 });
  }
}

