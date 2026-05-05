export function SetupRequired() {
  return (
    <main>
      <section>
        <h1>setup needed</h1>
        <h1>Connect Supabase first.</h1>
        <p>Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`, then restart `pnpm dev`.</p>
      </section>
    </main>
  );
}
