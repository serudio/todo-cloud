import "./AppState.css";

export function SetupRequired() {
  return (
    <main className="app auth-page">
      <section className="auth-card">
        <p className="eyebrow">setup needed</p>
        <h1>Connect Supabase first.</h1>
        <p>
          Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then
          restart `pnpm dev`.
        </p>
      </section>
    </main>
  );
}
