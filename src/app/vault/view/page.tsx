'use client';
import { useEffect, useState } from 'react';

import ChevronRight from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import {
    AppBar, Toolbar, Typography, IconButton, Container, Grid, Card, CardContent,
    Tooltip, TextField, Box, CircularProgress
} from '@mui/material';

interface VaultRecord {
    _id: string;
    website: string;
    username: string;
    password: string;
    createdAt: string;
}

export default function Dashboard() {
    const [records, setRecords] = useState<VaultRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            const res = await fetch('/api/vault/all');
            const data = await res.json();
            setRecords(data.records);
            setLoading(false);
        };

        fetchRecords();
    }, []);

    const filtered = records?.filter((r) =>
        r.website.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const validateMasterPassword = async (): Promise<string | null> => {
        let masterPassword = sessionStorage.getItem('masterPassword');

        if (!masterPassword) {
            masterPassword = prompt('🔐 Enter the *same* master password you used during sign-up:')?.trim() ?? '';
            if (!masterPassword) return null;

            // Validate master password with the backend before storing it
            const isValid = await validatePasswordWithBackend(masterPassword);
            if (!isValid) {
                alert('Incorrect password. Please try again.');
                sessionStorage.removeItem('masterPassword'); // Clear any previous invalid password
                return null;
            }

            // Store the valid password in sessionStorage
            sessionStorage.setItem('masterPassword', masterPassword);
        }

        return masterPassword;
    };

    const validatePasswordWithBackend = async (password: string): Promise<boolean> => {

        try {
            const res = await fetch('/api/vault/validate-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword: password }),
            });

            const data = await res.json();
            return data.success ?? false;
        } catch (error) {
            return error instanceof Error ? false : true;
        }
    };


    return (
        <>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        🔐 Vault Dashboard
                    </Typography>
                    <Tooltip title="Add New">
                        <IconButton color="inherit" onClick={() => router.push('/vault/create')}>
                            <Typography variant="h6">Create New Record</Typography>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton color="inherit" onClick={() => location.reload()}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Sign Out">
                        <IconButton color="inherit" onClick={() => {
                            sessionStorage.removeItem("masterPassword");
                            signOut({ callbackUrl: '/sign-in' });
                        }}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <TextField
                        type='search'
                        size="medium"
                        label="Search Websites for Passwords..."
                        variant="filled"
                        sx={{ width: '100%', backgroundColor: 'white', borderRadius: 5 }}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Box>
                <Typography fontSize={32} variant="h5" sx={{ mb: 2 }}>Passwords</Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="h6" color="textSecondary">
                            No passwords found. Click Create New Record to add your first password.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container>
                        {filtered?.map((record) => (
                            <Grid size={12} key={record._id}>
                                <Card
                                    onClick={async () => {
                                        const masterPassword = await validateMasterPassword();
                                        if (!masterPassword) return;
                                        router.push(`/vault/view/${record._id}`);
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 1,
                                        transition: 'transform 0.3s',
                                        borderBottom: '1px solid #ccc',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 'lighter' }}>
                                            {record.website}
                                        </Typography>
                                    </CardContent>
                                    <IconButton>
                                        <ChevronRight />
                                    </IconButton>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
}