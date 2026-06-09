import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BLUR_DATA_URL } from "@/lib/images";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const dict = await getDictionary();
  const lyrics = await prisma.lyric.findMany({
    where: { isPublic: true },
    include: { author: { select: { nickname: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell activeNav="explore">
      <main className="page">
        <section className="page-heading">
          <p className="eyebrow">{dict.explore.eyebrow}</p>
          <h1>{dict.explore.title}</h1>
          <p>{dict.explore.subtitle}</p>
        </section>

        {lyrics.length === 0 ? (
          <div className="empty-state">{dict.explore.empty}</div>
        ) : (
          <section className="feed-grid" aria-label={dict.explore.title}>
            {lyrics.map((lyric) => (
              <article className="lyric-card" key={lyric.id}>
                <Link className="lyric-card-link" href={`/explore/${lyric.id}`}>
                  <Image
                    src={lyric.imageUrl}
                    alt=""
                    width={720}
                    height={420}
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="card-image"
                  />
                  <div className="card-body">
                    <div>
                      <p className="muted">{lyric.author.nickname}</p>
                      <h2>{lyric.title}</h2>
                    </div>
                    <p className="lyric-preview">{lyric.body}</p>
                    <div className="card-footer">
                      <span>
                        BPM {lyric.bpm ?? "-"} · Key {lyric.key ?? "-"}
                      </span>
                      <span className="card-link-text">{dict.explore.open}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}
