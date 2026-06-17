import { loginAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { Field } from "@/components/Field";
import { getDictionary } from "@/lib/i18n";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [dict, params] = await Promise.all([getDictionary(), searchParams]);

  return (
    <AppShell>
      <main className="auth-page">
        <form className="panel auth-panel" action={loginAction}>
          <h1>{dict.auth.loginTitle}</h1>
          {params.error ? (
            <p className="form-error">{dict.auth.invalidCredentials}</p>
          ) : null}
          <input name="redirectTo" type="hidden" value={params.redirect ?? ""} />
          <Field label={dict.auth.email} name="email" type="email" required />
          <Field
            label={dict.auth.password}
            name="password"
            type="password"
            required
          />
          <button className="solid-button wide" type="submit">
            {dict.auth.loginSubmit}
          </button>
          <p className="auth-switch">
            {dict.auth.noAccount}{" "}
            <Link href="/signup">{dict.auth.goSignup}</Link>
          </p>
          <p className="muted">{dict.auth.demo}</p>
        </form>
      </main>
    </AppShell>
  );
}
