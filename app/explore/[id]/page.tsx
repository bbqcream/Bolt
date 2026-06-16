import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { BLUR_DATA_URL } from "@/lib/images";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  getFolderLabel,
  getProgressLabel,
  getSongFormLabel,
} from "@/lib/lyric-labels";
import { countLyricStats } from "@/lib/lyrics";
import { prisma } from "@/lib/prisma";

type ExploreDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ExploreDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const lyric = await prisma.lyric.findFirst({
    where: { id, isPublic: true },
    include: { author: { select: { nickname: true } } },
  });

  if (!lyric) {
    return { title: dict.status.exploreNotFound };
  }

  return {
    title: lyric.title,
    description:
      locale === "ko"
        ? `${lyric.author.nickname}의 공개 가사`
        : `Public lyric by ${lyric.author.nickname}`,
    openGraph: {
      title: lyric.title,
      description:
        locale === "ko"
          ? `${lyric.author.nickname}의 공개 가사`
          : `Public lyric by ${lyric.author.nickname}`,
      images: [{ url: lyric.imageUrl }],
    },
  };
}

export default async function ExploreDetailPage({
  params,
}: ExploreDetailPageProps) {
  const { id } = await params;
  const [dict, locale, user] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCurrentUser(),
  ]);

  const lyric = await prisma.lyric.findFirst({
    where: { id, isPublic: true },
    include: {
      author: { select: { id: true, nickname: true } },
      rhymeNotes: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!lyric) {
    notFound();
  }

  const stats = countLyricStats(lyric.body);
  const canEdit = user?.id === lyric.author.id;

  return (
    <AppShell activeNav="explore">
      <main className="editor-layout">
        <section className="editor-main">
          <div className="page-heading compact">
            <p className="eyebrow">{dict.explore.eyebrow}</p>
            <h1>{lyric.title}</h1>
            <p>
              {lyric.author.nickname} · BPM {lyric.bpm ?? "-"} · Key{" "}
              {lyric.key ?? "-"}
            </p>
          </div>

          <Image
            src={lyric.imageUrl}
            alt=""
            width={1200}
            height={520}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="hero-image"
            priority
          />

          <section className="stats-grid" aria-label={dict.editor.stats}>
            <article className="stats-card">
              <span>{dict.editor.lines}</span>
              <strong>{stats.lines}</strong>
            </article>
            <article className="stats-card">
              <span>{dict.editor.words}</span>
              <strong>{stats.words}</strong>
            </article>
            <article className="stats-card">
              <span>{dict.editor.characters}</span>
              <strong>{stats.characters}</strong>
            </article>
          </section>

          <article className="panel lyric-read-panel">
            <div className="section-row">
              <h2>{dict.editor.body}</h2>
              {canEdit ? (
                <Link className="solid-button" href={`/lyrics/${lyric.id}`}>
                  {dict.explore.open}
                </Link>
              ) : null}
            </div>
            <p className="lyric-detail-body">{lyric.body}</p>
          </article>
        </section>

        <aside className="editor-sidebar">
          <section className="panel metadata-panel">
            <div className="section-row metadata-header">
              <h2>{dict.editor.metadata}</h2>
              <span className="metadata-badge">
                {dict.dashboard.public}
              </span>
            </div>
            <dl className="metadata-rows">
              <div className="metadata-row">
                <dt>{dict.common.bpm}</dt>
                <dd>{lyric.bpm ?? "-"}</dd>
              </div>
              <div className="metadata-row">
                <dt>{dict.common.key}</dt>
                <dd>{lyric.key ?? "-"}</dd>
              </div>
              <div className="metadata-row">
                <dt>{dict.editor.songForm}</dt>
                <dd>{getSongFormLabel(dict, lyric.songForm)}</dd>
              </div>
              <div className="metadata-row">
                <dt>{dict.dashboard.folder}</dt>
                <dd>{getFolderLabel(dict, lyric.folder)}</dd>
              </div>
              <div className="metadata-row">
                <dt>{dict.dashboard.progress}</dt>
                <dd>{getProgressLabel(dict, lyric.progress)}</dd>
              </div>
              <div className="metadata-row">
                <dt>{dict.dashboard.updated}</dt>
                <dd>
                  {new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
                    month: "short",
                    day: "numeric",
                  }).format(lyric.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel rhyme-list-panel">
            <h2>{dict.editor.rhymeList}</h2>
            {lyric.rhymeNotes.length === 0 ? (
              <p className="rhyme-empty">{dict.editor.rhymeEmpty}</p>
            ) : (
              lyric.rhymeNotes.map((rhymeNote) => (
                <article className="rhyme-item" key={rhymeNote.id}>
                  <div>
                    <p className="muted">{rhymeNote.vowelPattern}</p>
                    <p className="rhyme-memo">{rhymeNote.memo}</p>
                  </div>
                </article>
              ))
            )}
          </section>
        </aside>
      </main>
    </AppShell>
  );
}
