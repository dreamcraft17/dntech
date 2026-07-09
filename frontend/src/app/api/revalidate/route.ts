import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PATHS = ['/', '/about'];

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let paths = DEFAULT_PATHS;
  try {
    const body = await request.json();
    if (Array.isArray(body.paths) && body.paths.length > 0) {
      paths = body.paths.filter((p: unknown) => typeof p === 'string');
    }
  } catch {
    // use defaults
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ success: true, revalidated: paths });
}
