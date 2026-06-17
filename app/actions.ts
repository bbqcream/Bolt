"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, getCurrentUser, setSession } from "@/lib/auth";
import { setFlashToast } from "@/lib/flash";
import { DEFAULT_MOOD_IMAGE } from "@/lib/images";
import {
  LYRIC_FOLDER_OPTIONS,
  LYRIC_PROGRESS_OPTIONS,
  LYRIC_SONG_FORM_OPTIONS,
} from "@/lib/lyrics";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasValue(formData: FormData, key: string) {
  return formData.has(key);
}

function getOptionalInt(formData: FormData, key: string) {
  const value = getString(formData, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeProgress(value: string) {
  return LYRIC_PROGRESS_OPTIONS.includes(
    value as (typeof LYRIC_PROGRESS_OPTIONS)[number],
  )
    ? value
    : LYRIC_PROGRESS_OPTIONS[0];
}

function normalizeFolder(value: string) {
  return LYRIC_FOLDER_OPTIONS.includes(
    value as (typeof LYRIC_FOLDER_OPTIONS)[number],
  )
    ? value
    : LYRIC_FOLDER_OPTIONS[0];
}

function normalizeSongForm(value: string) {
  return LYRIC_SONG_FORM_OPTIONS.includes(
    value as (typeof LYRIC_SONG_FORM_OPTIONS)[number],
  )
    ? value
    : LYRIC_SONG_FORM_OPTIONS[0];
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function signupAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const nickname = getString(formData, "nickname") || email.split("@")[0];

  if (!isValidEmail(email)) {
    redirect("/signup?error=invalid");
  }

  if (password.length < 6) {
    redirect("/signup?error=password");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/signup?error=exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, nickname },
  });

  await setSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) {
    redirect("/login?error=invalid");
  }

  await setSession(user.id);
  const redirectTo = getString(formData, "redirectTo");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/explore");
}

export async function createLyricAction(formData: FormData) {
  const user = await requireUser();
  const title = getString(formData, "title") || "Untitled lyric";
  const body = getString(formData, "body") || "새로운 한 줄을 적어보세요.";

  const lyric = await prisma.lyric.create({
    data: {
      title,
      body,
      imageUrl: getString(formData, "imageUrl") || DEFAULT_MOOD_IMAGE,
      bpm: getOptionalInt(formData, "bpm"),
      key: getString(formData, "key") || null,
      songForm: normalizeSongForm(getString(formData, "songForm")),
      folder: normalizeFolder(getString(formData, "folder")),
      progress: normalizeProgress(getString(formData, "progress")),
      isPublic: formData.get("isPublic") === "on",
      authorId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  await setFlashToast("saved");
  redirect(`/lyrics/${lyric.id}`);
}

export async function updateLyricAction(formData: FormData) {
  const user = await requireUser();
  const id = getString(formData, "id");
  const lyric = await prisma.lyric.findFirst({
    where: { id, authorId: user.id },
  });

  if (!lyric) {
    redirect("/dashboard");
  }

  await prisma.lyric.update({
    where: { id: lyric.id },
    data: {
      title: hasValue(formData, "title")
        ? getString(formData, "title") || "Untitled lyric"
        : lyric.title,
      body: hasValue(formData, "body") ? getString(formData, "body") : lyric.body,
      imageUrl: hasValue(formData, "imageUrl")
        ? getString(formData, "imageUrl") || DEFAULT_MOOD_IMAGE
        : lyric.imageUrl,
      bpm: hasValue(formData, "bpm")
        ? getOptionalInt(formData, "bpm")
        : lyric.bpm,
      key: hasValue(formData, "key")
        ? getString(formData, "key") || null
        : lyric.key,
      songForm: hasValue(formData, "songForm")
        ? normalizeSongForm(getString(formData, "songForm"))
        : lyric.songForm,
      folder: hasValue(formData, "folder")
        ? normalizeFolder(getString(formData, "folder"))
        : lyric.folder,
      progress: hasValue(formData, "progress")
        ? normalizeProgress(getString(formData, "progress"))
        : lyric.progress,
      isPublic: hasValue(formData, "isPublic")
        ? formData.get("isPublic") === "on"
        : lyric.isPublic,
    },
  });

  revalidatePath(`/lyrics/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  await setFlashToast("saved");
}

export async function deleteLyricAction(formData: FormData) {
  const user = await requireUser();
  const id = getString(formData, "id");
  const lyric = await prisma.lyric.findFirst({
    where: { id, authorId: user.id },
    select: { id: true },
  });

  if (!lyric) {
    redirect("/dashboard");
  }

  await prisma.lyric.delete({ where: { id: lyric.id } });
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  await setFlashToast("deleted");
  redirect("/dashboard");
}

export async function saveRhymeNoteAction(formData: FormData) {
  const user = await requireUser();
  const lyricId = getString(formData, "lyricId");
  const noteId = getString(formData, "noteId");

  const lyric = await prisma.lyric.findFirst({
    where: { id: lyricId, authorId: user.id },
    select: { id: true },
  });
  if (!lyric) redirect("/dashboard");

  const data = {
    vowelPattern: getString(formData, "vowelPattern") || "free",
    memo: getString(formData, "memo"),
  };

  if (noteId) {
    await prisma.rhymeNote.update({ where: { id: noteId }, data });
  } else {
    await prisma.rhymeNote.create({ data: { ...data, lyricId } });
  }

  revalidatePath(`/lyrics/${lyricId}`);
  await setFlashToast("saved");
}

export async function deleteRhymeNoteAction(formData: FormData) {
  const user = await requireUser();
  const lyricId = getString(formData, "lyricId");
  const noteId = getString(formData, "noteId");

  const lyric = await prisma.lyric.findFirst({
    where: { id: lyricId, authorId: user.id },
    select: { id: true },
  });
  if (!lyric) {
    redirect("/dashboard");
  }

  const note = await prisma.rhymeNote.findFirst({
    where: { id: noteId, lyricId: lyric.id },
    select: { id: true },
  });
  if (!note) {
    redirect(`/lyrics/${lyricId}`);
  }

  await prisma.rhymeNote.delete({ where: { id: note.id } });
  revalidatePath(`/lyrics/${lyricId}`);
  await setFlashToast("deleted");
}
