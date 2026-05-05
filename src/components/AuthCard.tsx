import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";

type AuthCardProps = {
  authError: string | null;
  onSignIn: () => void;
};

export function AuthCard({ authError, onSignIn }: AuthCardProps) {
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
        <Button onClick={onSignIn}>Continue with Google</Button>
      </CardActions>
      {authError && <p>{authError}</p>}
    </Card>
  );
}
