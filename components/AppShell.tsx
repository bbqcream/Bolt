import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { FlashToast } from "@/components/FlashToast";
import { getCurrentUser } from "@/lib/auth";
import { getFlashToast } from "@/lib/flash";
import { getDictionary, getLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function AppShell({
  children,
  activeNav,
}: {
  children: React.ReactNode;
  activeNav?: "explore" | "dashboard" | "new";
}) {
  const [dict, locale, user, flashToast] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCurrentUser(),
    getFlashToast(),
  ]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-surface">
          <Link className="brand" href="/explore">
            <span className="brand-mark">V</span>
            <span className="brand-copy">
              <strong>{dict.nav.brand}</strong>
              <span>{dict.nav.workspace}</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link
              aria-current={activeNav === "explore" ? "page" : undefined}
              className={activeNav === "explore" ? "nav-active" : undefined}
              href="/explore"
            >
              {dict.nav.explore}
            </Link>
            <Link
              aria-current={activeNav === "dashboard" ? "page" : undefined}
              className={activeNav === "dashboard" ? "nav-active" : undefined}
              href="/dashboard"
            >
              {dict.nav.dashboard}
            </Link>
            <Link
              aria-current={activeNav === "new" ? "page" : undefined}
              className={activeNav === "new" ? "nav-active" : undefined}
              href="/lyrics/new"
            >
              {dict.nav.newLyric}
            </Link>
          </nav>
          <div className="nav-actions">
            {user ? <span className="user-pill">{user.nickname}</span> : null}
            <LocaleSwitcher locale={locale} />
            {user ? (
              <form action={logoutAction}>
                <button className="ghost-button" type="submit">
                  {dict.nav.logout}
                </button>
              </form>
            ) : (
              <>
                <Link className="ghost-button" href="/login">
                  {dict.nav.login}
                </Link>
                <Link className="solid-button" href="/signup">
                  {dict.nav.signup}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <FlashToast
        key={flashToast?.id ?? "empty"}
        toast={flashToast}
        message={
          flashToast?.kind === "deleted" ? dict.toast.deleted : dict.toast.saved
        }
      />
      {children}
    </div>
  );
}
