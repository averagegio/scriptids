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
  const fresh: UploadIndex = { version: 1, uploads: [] };
  await fs.writeFile(indexPath(), JSON.stringify(fresh, null, 2), "utf8");
  return fresh;
}

async function writeIndex(next: UploadIndex) {
  await fs.mkdir(uploadsDir(), { recursive: true });
  await fs.writeFile(indexPath(), JSON.stringify(next, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function extFor(contentType: string, originalName: string) {
  const lower = originalName.toLowerCase();
  if (contentType === "image/png" || lower.endsWith(".png")) return ".png";
  if (contentType === "image/webp" || lower.endsWith(".webp")) return ".webp";
  if (contentType === "image/gif" || lower.endsWith(".gif")) return ".gif";
  return ".jpg";
}

export async function GET() {
  const idx = await readIndex();
  return Response.json(withApiLinks({ uploads: idx.uploads }));
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(withApiLinks({ error: "file required" }), { status: 400 });
  }
  const contentType = file.type || "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    return Response.json(withApiLinks({ error: "Only image uploads are supported" }), {
      status: 400,
    });
  }
  const sizeBytes = file.size;
  if (sizeBytes <= 0) {
    return Response.json(withApiLinks({ error: "Empty file" }), { status: 400 });
  }
  if (sizeBytes > 8 * 1024 * 1024) {
    return Response.json(withApiLinks({ error: "Max file size is 8MB" }), {
      status: 400,
    });
  }

  const id = `up_${crypto.randomUUID()}`;
  const originalName = file.name || "upload";
  const fileName = `${id}${extFor(contentType, originalName)}`;
  const outPath = path.join(uploadsDir(), fileName);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outPath, buf);

  const idx = await readIndex();
  const rec: UploadRecord = {
    id,
    createdAt: nowIso(),
    originalName,
    contentType,
    sizeBytes,
    fileName,
  };
  await writeIndex({ ...idx, uploads: [rec, ...idx.uploads].slice(0, 200) });

  return Response.json(
    withApiLinks({
      upload: {
        ...rec,
        url: `/api/uploads/${encodeURIComponent(rec.id)}`,
      },
    }),
    { status: 201 },
  );
}

