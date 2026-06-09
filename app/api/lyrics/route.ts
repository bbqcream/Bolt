import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const lyrics = await prisma.lyric.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      imageUrl: true,
      bpm: true,
      key: true,
      createdAt: true,
      author: { select: { nickname: true } },
    },
  });

  return NextResponse.json({ lyrics });
}
