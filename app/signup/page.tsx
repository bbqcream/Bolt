import { signupAction } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { Field } from "@/components/Field";
import { getDictionary } from "@/lib/i18n";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const [dict, params] = await Promise.all([getDictionary(), searchParams]);

  return (
    <AppShell>
      <main className="auth-page">
        <form className="panel auth-panel" action={signupAction}>
          <h1>{dict.auth.signupTitle}</h1>
          {params.error ? (
            <p className="form-error">{dict.auth.invalidSignup}</p>
          ) : null}
          <Field label={dict.auth.nickname} name="nickname" required />
          <Field label={dict.auth.email} name="email" type="email" required />
          <Field
            label={dict.auth.password}
            name="password"
            type="password"
            required
          />
          <button className="solid-button wide" type="submit">
            {dict.auth.signupSubmit}
          </button>
        </form>
      </main>
    </AppShell>
  );
}
