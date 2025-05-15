'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { signIn } from 'next-auth/react';

import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Alert,
    Paper,
    CircularProgress,
} from '@mui/material';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [masterPassword, setmasterPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Register User
            const res = await fetch('/api/sign-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, masterPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            // Step 2: Sign In the User
            const result = await signIn('credentials', {
                redirect: true,
                email: email,
                masterPassword: masterPassword,
            });
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else {
                router.push('/vault/view');
            }
        } catch (err: Error
            | string
            | { message?: string }
            | { error?: string } // Adjusted type to include error property
            | unknown // Fallback for any other types
            | undefined // Handle undefined case
        ) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Create an Account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="masterPassword"
                        label="masterPassword"
                        type="masterPassword"
                        id="masterPassword"
                        autoComplete="current-masterPassword"
                        value={masterPassword}
                        onChange={(e) => setmasterPassword(e.target.value)}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <Button variant="text" onClick={() => router.push('/sign-in')}>
                            Sign In
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}