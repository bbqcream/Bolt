import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const dict = await getDictionary();

  return (
    <main className="auth-page">
      <div className="panel auth-panel">
        <h1>{dict.status.notFound}</h1>
        <Link className="solid-button" href="/explore">
          {dict.common.goExplore}
        </Link>
      </div>
    </main>
  );
}
