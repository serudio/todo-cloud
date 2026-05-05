import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import { useState } from "react";
import { supabase } from "../supabase";

export const AuthCard: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  // Starts the Google OAuth flow through Supabase.
  async function signInWithGoogle() {
    if (!supabase) return;

    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).toString() },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  return (
    <Card sx={{ maxWidth: 400, margin: "auto", mt: 8, p: 2 }}>
      <CardHeader title="ToDo Cloud" />

      <CardContent>
        <Typography variant="h5">Sign in to sync your cloud.</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Use Google to keep your todos available across devices.
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={signInWithGoogle}>Continue with Google</Button>
      </CardActions>
      {authError && <p>{authError}</p>}
    </Card>
  );
};
