
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
    Alert,
} from '@mui/material';

export default function CreateVaultEntry() {
    const [website, setWebsite] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [isMasterPasswordValid, setIsMasterPasswordValid] = useState(false);
    const [masterPasswordError, setMasterPasswordError] = useState('');
    const [verifying, setVerifying] = useState(false); // separate loading for verify button
    const router = useRouter();

    const checkMasterPassword = async (masterPassword: string) => {
        setMasterPasswordError('');
        setVerifying(true);
        try {
            const res = await fetch('/api/vault/validate-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setIsMasterPasswordValid(true);
            } else {
                setMasterPasswordError(data.error || 'Invalid master password.');
                setIsMasterPasswordValid(false);
            }
        } catch (err: Error | string | { message?: string } | { error?: string } | unknown | undefined) {
            setMasterPasswordError('Failed to verify master password.');
            setIsMasterPasswordValid(false);
            setError((err as { message?: string }).message || 'An error occurred.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMasterPasswordValid) {
            setError('Please verify your master password first.');
            return;
        }

        setLoading(true);
        setStatus('');
        setError('');

        try {
            const res = await fetch('/api/vault/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ website, username, password, masterPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('Password saved successfully!');
                setTimeout(() => router.push('/vault/view'), 1500);
            } else if (data.error === 'Unauthorized') {
                setError('Unauthorized access. Please check your master password.');
            } else {
                setError(data.error || 'Failed to save password.');
            }
        } catch (err) {
            setError((err as { message?: string }).message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Create Password Record
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                <TextField
                    label="Master Password"
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    required
                    fullWidth
                    error={!!masterPasswordError}
                    helperText={masterPasswordError}
                />
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => checkMasterPassword(masterPassword)}
                    disabled={!masterPassword || isMasterPasswordValid || verifying}
                    fullWidth
                >
                    {isMasterPasswordValid
                        ? 'Master Password Verified'
                        : verifying
                            ? <CircularProgress size={20} />
                            : 'Verify Master Password'}
                </Button>
                <TextField
                    label="Website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !isMasterPasswordValid}
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </Box>
            {status && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {status}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Container>
    );
}
