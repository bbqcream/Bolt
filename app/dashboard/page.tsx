import Link from "next/link";
import { deleteLyricAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { LYRIC_PROGRESS_OPTIONS } from "@/lib/lyrics";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    progress?: string;
    folder?: string;
    visibility?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [dict, locale, user] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCurrentUser(),
  ]);
  if (!user) return null;

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const progress = params.progress?.trim() ?? "all";
  const folder = params.folder?.trim() ?? "all";
  const visibility = params.visibility?.trim() ?? "all";

  const baseWhere = {
    authorId: user.id,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { body: { contains: query } },
          ],
        }
      : {}),
    ...(progress !== "all" ? { progress } : {}),
    ...(folder !== "all" ? { folder } : {}),
    ...(visibility === "public"
      ? { isPublic: true }
      : visibility === "private"
        ? { isPublic: false }
        : {}),
  };

  const [lyrics, allLyrics] = await Promise.all([
    prisma.lyric.findMany({
      where: baseWhere,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lyric.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        folder: true,
        progress: true,
        isPublic: true,
      },
    }),
  ]);

  const folders = Array.from(new Set(allLyrics.map((lyric) => lyric.folder)));
  const totalCount = allLyrics.length;
  const publicCount = allLyrics.filter((lyric) => lyric.isPublic).length;
  const draftCount = allLyrics.filter((lyric) => lyric.progress === "Draft").length;
  const readyCount = allLyrics.filter(
    (lyric) => lyric.progress === "Ready to Share",
  ).length;

  return (
    <AppShell activeNav="dashboard">
      <main className="page dashboard-grid">
        <section className="page-heading">
          <p className="eyebrow">{user.nickname}</p>
          <h1>{dict.dashboard.title}</h1>
          <p>{dict.dashboard.subtitle}</p>
        </section>

        <section className="summary-grid" aria-label="Archive summary">
          <article className="summary-card">
            <span>{dict.dashboard.summaryTotal}</span>
            <strong>{totalCount}</strong>
          </article>
          <article className="summary-card">
            <span>{dict.dashboard.summaryPublic}</span>
            <strong>{publicCount}</strong>
          </article>
          <article className="summary-card">
            <span>{dict.dashboard.summaryDraft}</span>
            <strong>{draftCount}</strong>
          </article>
          <article className="summary-card">
            <span>{dict.dashboard.summaryReady}</span>
            <strong>{readyCount}</strong>
          </article>
        </section>

        <section className="archive-list archive-list-full">
          <form className="panel filter-panel" method="get">
            <div className="filter-grid">
              <label className="field filter-field filter-search">
                <span>{dict.dashboard.search}</span>
                <input
                  defaultValue={query}
                  name="q"
                  placeholder={dict.dashboard.searchPlaceholder}
                  type="search"
                />
              </label>
              <label className="field filter-field">
                <span>{dict.dashboard.progress}</span>
                <select defaultValue={progress} name="progress">
                  <option value="all">{dict.dashboard.all}</option>
                  {LYRIC_PROGRESS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field filter-field">
                <span>{dict.dashboard.folder}</span>
                <select defaultValue={folder} name="folder">
                  <option value="all">{dict.dashboard.all}</option>
                  {folders.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field filter-field">
                <span>{dict.dashboard.visibility}</span>
                <select defaultValue={visibility} name="visibility">
                  <option value="all">{dict.dashboard.all}</option>
                  <option value="public">{dict.dashboard.public}</option>
                  <option value="private">{dict.dashboard.private}</option>
                </select>
              </label>
            </div>
            <div className="filter-actions">
              <button className="solid-button" type="submit">
                {dict.dashboard.apply}
              </button>
              <Link className="ghost-button" href="/dashboard">
                {dict.dashboard.reset}
              </Link>
            </div>
          </form>

          {lyrics.length === 0 ? (
            <div className="empty-state">{dict.dashboard.empty}</div>
          ) : (
            lyrics.map((lyric) => (
              <article className="archive-item" key={lyric.id}>
                <div>
                  <p className="muted">
                    {lyric.folder} · {lyric.progress} ·{" "}
                    {lyric.isPublic ? dict.dashboard.public : dict.dashboard.private}
                  </p>
                  <h2>
                    <Link href={`/lyrics/${lyric.id}`}>{lyric.title}</Link>
                  </h2>
                  <p>{lyric.body}</p>
                  <span className="archive-timestamp">
                    {dict.dashboard.updated}:{" "}
                    {new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(lyric.updatedAt)}
                  </span>
                </div>
                <div className="archive-actions">
                  <Link className="ghost-button" href={`/lyrics/${lyric.id}`}>
                    {dict.dashboard.open}
                  </Link>
                  <form action={deleteLyricAction}>
                    <input name="id" type="hidden" value={lyric.id} />
                    <button className="danger-button" type="submit">
                      {dict.dashboard.delete}
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </AppShell>
  );
}
