'use client';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Button, CircularProgress, Container, FormControl, IconButton, InputLabel, OutlinedInput, TextField, Tooltip, Typography
} from '@mui/material';
import { decryptData, deriveKey } from '@/utils/encryption';

import {
    InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function VaultDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const [data, setData] = useState({
        website: '',
        username: '',
        password: '',
        masterPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const masterPassword = sessionStorage.getItem("masterPassword");
        if (!masterPassword) {
            alert("Master password not found. Please go back and enter it again.");
            setLoading(false);
            return;
        }
        const res = await fetch('/api/vault/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: id, masterPassword: masterPassword }),
        });

        const result = await res.json();

        const encryptedData = result.record.password;
        const iv = result.record.iv;
        const authTag = result.record.authTag;
        const salt = result.record.salt;

        const derivedKey = deriveKey(masterPassword, salt); // must match encryption-time salt
        const decryptedPassword = decryptData(encryptedData, derivedKey, iv, authTag);
        console.log('Decrypted Password:', decryptedPassword);
        if (res.ok && result.record && result?.record?.password) {

            setData({
                website: result.record.website,
                username: result.record.username,
                password: decryptedPassword,
                masterPassword: masterPassword,
            });
        } else {
            alert('Failed to fetch or decrypt the record. Please try again.');
            router.push('/vault/view');
        }

        setLoading(false);
    }, [id, router]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdate = async () => {
        setLoading(true);
        const masterPassword = sessionStorage.getItem("masterPassword");
        if (!masterPassword) {
            alert("Master password not found. Please go back and enter it again.");
            setLoading(false);
            return;
        }
        const res = await fetch('/api/vault/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recordId: id,
                website: data.website,
                username: data.username,
                password: data.password,
                masterPassword: masterPassword,
            }),
        });

        if (res.ok) {
            alert('Updated successfully');
            router.push('/vault/view');
        } else {
            alert('Update failed');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Delete this record?')) return;
        setLoading(true);
        const res = await fetch('/api/vault/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: id }),
        });

        if (res.ok) {
            alert('Deleted');
            router.push('/vault/view');
        } else {
            alert('Delete failed');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={() => router.push('/vault/view')}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" ml={1}>Edit Record</Typography>
            </Box>

            <TextField
                fullWidth
                label="Website"
                value={data.website}
                margin="normal"
                onChange={(e) => setData({ ...data, website: e.target.value })}
            />
            <TextField
                fullWidth
                label="Username"
                value={data.username}
                margin="normal"
                onChange={(e) => setData({ ...data, username: e.target.value })}
            />
            {/* <TextField
                fullWidth
                label="Password"
                type="text"
                value={data.password}
                margin="normal"
                onChange={(e) => setData({ ...data, password: e.target.value })}
            /> */}
            <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="password-field">Password</InputLabel>
                <OutlinedInput
                    id="password-field"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                            <IconButton onClick={() => navigator.clipboard.writeText(data.password)} edge="end">
                                <ContentCopyIcon />
                            </IconButton>
                        </InputAdornment>
                    }
                    label="Password"
                />
            </FormControl>
            <Box mt={2} display="flex" gap={2}>

                <Tooltip title="Save Changes">
                    <Button variant="contained" color="primary" onClick={handleUpdate}>
                        Save
                    </Button>
                </Tooltip>
                <Tooltip title="Delete Record">
                    <Button variant="outlined" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </Tooltip>
            </Box>
        </Container>
    );
}