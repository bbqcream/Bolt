import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteLyricAction,
  deleteRhymeNoteAction,
  saveRhymeNoteAction,
  updateLyricAction,
} from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { Field, SelectField, TextAreaField } from "@/components/Field";
import { SmartForm } from "@/components/SmartForm";
import { getCurrentUser } from "@/lib/auth";
import { BLUR_DATA_URL } from "@/lib/images";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  getFolderOptions,
  getProgressOptions,
  getSongFormOptions,
} from "@/lib/lyric-labels";
import {
  countLyricStats,
} from "@/lib/lyrics";
import { prisma } from "@/lib/prisma";

type LyricPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ note?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LyricPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const lyric = await prisma.lyric.findUnique({
    where: { id },
    include: { author: { select: { nickname: true } } },
  });

  if (!lyric) return { title: dict.status.editorNotFound };

  return {
    title: lyric.title,
    description:
      locale === "ko"
        ? `${lyric.author.nickname}의 ${lyric.title}`
        : `${lyric.title} by ${lyric.author.nickname}`,
    openGraph: {
      title: lyric.title,
      description:
        locale === "ko"
          ? `${lyric.author.nickname}의 ${lyric.title}`
          : `${lyric.title} by ${lyric.author.nickname}`,
      images: [{ url: lyric.imageUrl }],
    },
  };
}

export default async function LyricPage({
  params,
  searchParams,
}: LyricPageProps) {
  const { id } = await params;
  const { note } = await searchParams;
  const [dict, user] = await Promise.all([getDictionary(), getCurrentUser()]);
  if (!user) return null;

  const lyric = await prisma.lyric.findFirst({
    where: { id, authorId: user.id },
    include: { rhymeNotes: { orderBy: { updatedAt: "desc" } } },
  });

  if (!lyric) notFound();

  const selectedRhymeNote =
    lyric.rhymeNotes.find((entry) => entry.id === note) ?? null;
  const stats = countLyricStats(lyric.body);
  const folderOptions = getFolderOptions(dict);
  const progressOptions = getProgressOptions(dict);
  const songFormOptions = getSongFormOptions(dict);

  return (
    <AppShell>
      <main>
        <SmartForm
          action={updateLyricAction}
          className="editor-layout"
          dirtyWarningMessage={dict.confirm.leaveEditor}
          enableSaveShortcut
          warnOnDirtyExit
        >
          <input name="id" type="hidden" value={lyric.id} />
          <section className="editor-main">
            <div className="page-heading compact">
              <p className="eyebrow">{dict.editor.title}</p>
              <h1>{lyric.title}</h1>
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

            <section className="panel editor-form">
              <Field
                label={dict.common.title}
                name="title"
                defaultValue={lyric.title}
                required
              />
              <TextAreaField
                label={dict.editor.body}
                name="body"
                defaultValue={lyric.body}
                rows={12}
              />
              <Field
                label={dict.common.moodImageUrl}
                name="imageUrl"
                defaultValue={lyric.imageUrl}
              />
              <label className="check-row">
                <input
                  name="isPublic"
                  type="checkbox"
                  defaultChecked={lyric.isPublic}
                />
                <span>{dict.editor.public}</span>
              </label>
              <div className="form-actions">
                <button className="solid-button" type="submit">
                  {dict.editor.save}
                </button>
                <button
                  className="danger-button"
                  form="delete-lyric-form"
                  type="submit"
                >
                  {dict.editor.delete}
                </button>
              </div>
            </section>
          </section>

          <aside className="editor-sidebar">
            <section className="panel">
              <h2>{dict.editor.metadata}</h2>
              <Field
                label={dict.common.bpm}
                name="bpm"
                type="number"
                defaultValue={lyric.bpm}
              />
              <Field label={dict.common.key} name="key" defaultValue={lyric.key} />
              <SelectField
                label={dict.editor.songForm}
                name="songForm"
                defaultValue={lyric.songForm}
                options={songFormOptions}
              />
              <SelectField
                label={dict.dashboard.folder}
                name="folder"
                defaultValue={lyric.folder}
                options={folderOptions}
              />
              <SelectField
                label={dict.dashboard.progress}
                name="progress"
                defaultValue={lyric.progress}
                options={progressOptions}
              />
              <button className="solid-button wide" type="submit">
                {dict.editor.save}
              </button>
            </section>
          </aside>
        </SmartForm>

        <SmartForm
          action={deleteLyricAction}
          confirmMessage={dict.confirm.deleteLyric}
          id="delete-lyric-form"
        >
          <input name="id" type="hidden" value={lyric.id} />
        </SmartForm>

        <section className="editor-layout editor-layout-secondary">
          <div />
          <div className="editor-sidebar">
            <SmartForm
              action={saveRhymeNoteAction}
              className="panel"
              dirtyWarningMessage={dict.confirm.leaveEditor}
              enableSaveShortcut
              id="rhyme-panel"
              warnOnDirtyExit
            >
              <input name="lyricId" type="hidden" value={lyric.id} />
              <input
                name="noteId"
                type="hidden"
                value={selectedRhymeNote?.id ?? ""}
              />
              <div className="section-row">
                <h2>
                  {selectedRhymeNote
                    ? dict.editor.rhymeEditTitle
                    : dict.editor.rhymeNew}
                </h2>
                {selectedRhymeNote ? (
                  <Link
                    className="ghost-button"
                    href={`/lyrics/${lyric.id}#rhyme-panel`}
                  >
                    {dict.editor.rhymeCancel}
                  </Link>
                ) : null}
              </div>
              <Field
                label={dict.common.vowelPattern}
                name="vowelPattern"
                defaultValue={selectedRhymeNote?.vowelPattern ?? ""}
                placeholder="ae-ai"
              />
              <TextAreaField
                label={dict.common.memo}
                name="memo"
                defaultValue={selectedRhymeNote?.memo ?? ""}
                rows={7}
              />
              <button className="solid-button wide" type="submit">
                {dict.editor.rhymeSave}
              </button>
            </SmartForm>

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
                    <div className="rhyme-actions">
                      <Link
                        className="ghost-button"
                        href={`/lyrics/${lyric.id}?note=${rhymeNote.id}#rhyme-panel`}
                      >
                        {dict.editor.rhymeEdit}
                      </Link>
                      <SmartForm
                        action={deleteRhymeNoteAction}
                        confirmMessage={dict.confirm.deleteRhyme}
                      >
                        <input name="lyricId" type="hidden" value={lyric.id} />
                        <input name="noteId" type="hidden" value={rhymeNote.id} />
                        <button className="danger-button" type="submit">
                          {dict.editor.rhymeDelete}
                        </button>
                      </SmartForm>
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
