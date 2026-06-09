import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const imageUrl =
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80";

async function main() {
  const passwordHash = await bcrypt.hash("volt1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@volt.local" },
    update: {},
    create: {
      email: "demo@volt.local",
      passwordHash,
      nickname: "Volt Demo",
    },
  });

  const lyric = await prisma.lyric.upsert({
    where: { id: "demo-public-lyric" },
    update: {},
    create: {
      id: "demo-public-lyric",
      title: "Neon Memo",
      body: "Late train humming under Seoul rain\nI catch a phrase before it fades again",
      imageUrl,
      bpm: 92,
      key: "F#m",
      songForm: "Verse - Hook - Bridge",
      isPublic: true,
      folder: "Public Sparks",
      progress: "Polishing",
      authorId: user.id,
    },
  });

  await prisma.rhymeNote.upsert({
    where: { id: "demo-rhyme-note" },
    update: {},
    create: {
      id: "demo-rhyme-note",
      lyricId: lyric.id,
      vowelPattern: "ae-ai",
      memo: "rain / again / train 계열로 후렴 끝 운율 후보",
    },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
