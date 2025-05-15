'use client';

import { Box, Button, Container, Typography, Stack, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e3f2fd, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h3" color="primary" gutterBottom>
            🔐 SecureVault
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Manage your passwords securely. Encrypt, store, and retrieve credentials anytime, anywhere.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push('/sign-in')}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => router.push('/sign-up')}
            >
              Get Started
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
