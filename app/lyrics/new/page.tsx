import { createLyricAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { Field, SelectField, TextAreaField } from "@/components/Field";
import { getDictionary } from "@/lib/i18n";
import {
  LYRIC_FOLDER_OPTIONS,
  LYRIC_PROGRESS_OPTIONS,
  LYRIC_SONG_FORM_OPTIONS,
} from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export default async function NewLyricPage() {
  const dict = await getDictionary();

  return (
    <AppShell activeNav="new">
      <form className="editor-layout create-layout-form" action={createLyricAction}>
        <section className="editor-main">
          <div className="page-heading compact">
            <p className="eyebrow">{dict.editor.newSection}</p>
            <h1>{dict.editor.newTitle}</h1>
            <p>{dict.editor.newSubtitle}</p>
          </div>

          <section className="panel editor-form">
            <Field label={dict.common.title} name="title" required />
            <TextAreaField label={dict.editor.body} name="body" rows={14} />
            <Field
              label={dict.common.moodImageUrl}
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
            />
            <label className="check-row">
              <input name="isPublic" type="checkbox" />
              <span>{dict.editor.public}</span>
            </label>
            <div className="form-actions">
              <button className="solid-button" type="submit">
                {dict.dashboard.create}
              </button>
            </div>
          </section>
        </section>

        <aside className="editor-sidebar">
          <section className="panel create-side-panel">
            <h2>{dict.editor.metadata}</h2>
            <div className="create-side-grid">
              <Field label={dict.common.bpm} name="bpm" type="number" />
              <Field label={dict.common.key} name="key" placeholder="F#m" />
              <SelectField
                label={dict.editor.songForm}
                name="songForm"
                defaultValue={LYRIC_SONG_FORM_OPTIONS[0]}
                options={LYRIC_SONG_FORM_OPTIONS}
              />
              <SelectField
                label={dict.dashboard.folder}
                name="folder"
                defaultValue={LYRIC_FOLDER_OPTIONS[0]}
                options={LYRIC_FOLDER_OPTIONS}
              />
              <SelectField
                label={dict.dashboard.progress}
                name="progress"
                defaultValue={LYRIC_PROGRESS_OPTIONS[0]}
                options={LYRIC_PROGRESS_OPTIONS}
              />
            </div>
            <p className="panel-description">{dict.editor.newHint}</p>
          </section>
        </aside>
      </form>
    </AppShell>
  );
}
