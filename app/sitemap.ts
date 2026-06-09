import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "http://localhost:3000";
  const publicLyrics = await prisma.lyric.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: `${baseUrl}/explore`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
    { url: `${baseUrl}/signup`, lastModified: new Date() },
    ...publicLyrics.map((lyric) => ({
      url: `${baseUrl}/lyrics/${lyric.id}`,
      lastModified: lyric.updatedAt,
    })),
  ];
}
