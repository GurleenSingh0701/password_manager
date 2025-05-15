'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Grid,
    Link,
} from '@mui/material';
import { useRouter } from 'next/navigation';
const SignInPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [masterPassword, setmasterPassword] = useState('');
    const [error, setError] = useState('');
    console.log('SignInPage rendered');
    const router = useRouter();
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        const result = await signIn('credentials', {
            redirect: false,
            email,
            masterPassword,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push('/vault/view'); // Redirect to the home page or dashboard
            console.log('Signed in successfully');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Container
                component="main"
                maxWidth="xs"
                sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    boxShadow: 3,
                    padding: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Sign In
                    </Typography>
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid size={12}>
                                <Box textAlign="center">
                                    {"Don't have an account? "}
                                    <Link href="/sign-up" variant="body2">
                                        {"Sign Up"}
                                    </Link>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default SignInPage;




