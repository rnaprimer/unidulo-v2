import type { Metadata } from "next";
import { Suspense } from "react";
import { signIn } from "../actions";
import { SubmitButton, opsInput } from "../ui";

export const metadata: Metadata = { title: "Sign in" };

// There is no sign-up here on purpose. The one account is created by hand in Supabase.
export default function Login({ searchParams }: PageProps<"/ops/login">) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="display text-2xl">Sign in</h1>
      <p className="mt-2 text-muted">For the owner of Unidulo only.</p>

      <Suspense fallback={null}>
        <Message searchParams={searchParams} />
      </Suspense>

      <form action={signIn} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className={`${opsInput} mt-1.5`}
          />
        </div>
        <div>
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`${opsInput} mt-1.5`}
          />
        </div>
        <SubmitButton busy="Signing in…">Sign in</SubmitButton>
      </form>
    </div>
  );
}

async function Message({ searchParams }: Pick<PageProps<"/ops/login">, "searchParams">) {
  const query = await searchParams;
  // One message for every kind of failed sign-in, so the page gives nothing away.
  const [text, bad] = query.error
    ? ["That email and password didn't work.", true]
    : query.expired
      ? ["Your session ended. Sign in again.", false]
      : query.signedout
        ? ["You're signed out.", false]
        : ["", false];
  if (!text) return null;
  return (
    <p
      role={bad ? "alert" : "status"}
      className={`mt-4 rounded-sm border bg-surface px-3 py-2 text-sm font-medium ${bad ? "border-error text-error" : "border-line"}`}
    >
      {text}
    </p>
  );
}
