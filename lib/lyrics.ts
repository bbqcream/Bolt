export const LYRIC_PROGRESS_OPTIONS = [
  "Draft",
  "Polishing",
  "Ready to Share",
  "Completed",
] as const;

export const LYRIC_FOLDER_OPTIONS = [
  "Inbox",
  "Verse Ideas",
  "Hook Lab",
  "Public Sparks",
] as const;

export const LYRIC_SONG_FORM_OPTIONS = [
  "Verse / Hook",
  "Verse / Pre / Hook",
  "Verse / Hook / Bridge",
  "Free Form",
] as const;

export function countLyricStats(body: string) {
  const trimmed = body.trim();
  const lines = trimmed ? body.split(/\r?\n/).length : 0;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = body.replace(/\s/g, "").length;

  return { lines, words, characters };
}
