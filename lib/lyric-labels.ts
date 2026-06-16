import type { dictionaries } from "@/lib/dictionaries";
import {
  LYRIC_FOLDER_OPTIONS,
  LYRIC_PROGRESS_OPTIONS,
  LYRIC_SONG_FORM_OPTIONS,
} from "@/lib/lyrics";

type Dictionary = (typeof dictionaries)[keyof typeof dictionaries];

function getLabel(
  group: Record<string, string> | undefined,
  value: string | null | undefined,
) {
  if (!value) return "-";
  return group?.[value] ?? value;
}

export function getProgressLabel(dict: Dictionary, value: string | null | undefined) {
  return getLabel(dict.lyrics?.progressLabels, value);
}

export function getFolderLabel(dict: Dictionary, value: string | null | undefined) {
  return getLabel(dict.lyrics?.folderLabels, value);
}

export function getSongFormLabel(dict: Dictionary, value: string | null | undefined) {
  return getLabel(dict.lyrics?.songFormLabels, value);
}

export function getProgressOptions(dict: Dictionary) {
  return LYRIC_PROGRESS_OPTIONS.map((value) => ({
    value,
    label: getProgressLabel(dict, value),
  }));
}

export function getFolderOptions(dict: Dictionary) {
  return LYRIC_FOLDER_OPTIONS.map((value) => ({
    value,
    label: getFolderLabel(dict, value),
  }));
}

export function getSongFormOptions(dict: Dictionary) {
  return LYRIC_SONG_FORM_OPTIONS.map((value) => ({
    value,
    label: getSongFormLabel(dict, value),
  }));
}
