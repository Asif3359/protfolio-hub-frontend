"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { green } from "@mui/material/colors";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://protfolio-hub.vercel.app/api";

interface BasicUserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface BasicProfileInfo {
  headline?: string;
  profileImage?: string;
}

interface CombinedUserProfile {
  user: BasicUserInfo;
  profile: BasicProfileInfo | null;
}

function UsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState<CombinedUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<BasicUserInfo | null>(null);
  const [search, setSearch] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load users");
      }

      const json = await response.json();
    //   console.log('json:', json);
      const payload = Array.isArray(json) ? json : json?.data;

      const isRecord = (val: unknown): val is Record<string, unknown> =>
        typeof val === "object" && val !== null;

      const isBasicUserInfo = (val: unknown): val is BasicUserInfo =>
        isRecord(val) && typeof val._id === "string" && typeof val.email === "string";

      const isCombinedUserProfile = (
        val: unknown
      ): val is { user: BasicUserInfo; profile?: BasicProfileInfo | null } =>
        isRecord(val) && isRecord(val.user) && isBasicUserInfo(val.user);

      const normalizeToCombined = (input: unknown): CombinedUserProfile[] => {
        if (!Array.isArray(input)) return [];
        return input
          .map((item) => {
            if (isCombinedUserProfile(item)) {
              return {
                user: item.user,
                profile: (item.profile as BasicProfileInfo) ?? null,
              };
            }
            if (isBasicUserInfo(item)) {
              return { user: item, profile: null };
            }
            return null;
          })
          .filter((x): x is CombinedUserProfile => Boolean(x));
      };

      const list = normalizeToCombined(payload);
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }

      setUsers(prev => prev.filter(item => item.user._id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const promptDelete = (user: BasicUserInfo) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(({ user, profile }) => {
      const hay = [user.name, user.email, user.role, profile?.headline]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack 
        direction={isMobile ? "column" : "row"} 
        justifyContent="space-between" 
        alignItems={isMobile ? "stretch" : "center"} 
        mb={2} 
        gap={2}
      >
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography variant="h4" color="primary">Users</Typography>
          <Chip label={`${users.length} total`} color="primary" variant="outlined" size="small" />
        </Stack>
        <Stack 
          direction={isMobile ? "column" : "row"} 
          alignItems="center" 
          gap={1} 
          flexWrap="wrap"
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          />
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchUsers}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Mobile Card View */}
      {isMobile ? (
        <Stack spacing={2}>
          {visibleUsers.map((item, index) => {
            const u = item?.user as BasicUserInfo | undefined;
            const p = item?.profile as BasicProfileInfo | null | undefined;
            return (
              <Card key={u?._id || index} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header with Avatar and Name */}
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{position:"relative"}}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={(p?.profileImage as string) || undefined}
                          alt={u?.name || "User"}
                          sx={{ width: 48, height: 48 }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight="medium">
                            {u?.name ?? "-"}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary" sx={{fontSize:"12px"}}>
                            {u?.email ?? "-"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Tooltip title="Delete user" sx={{position:"absolute", right:-10, top:-10}}>
                        <IconButton 
                          aria-label="delete" 
                          color="error" 
                          onClick={() => u && promptDelete(u)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Divider />
                    {/* Role and Headline */}
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                          Role:
                        </Typography>
                        <Chip
                          label={u?.role ?? "-"}
                          size="small"
                          color={u?.role?.toLowerCase() === 'admin' ? 'primary' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Stack>
                      
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                          Headline:
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, fontSize:"12px" }}>
                          {(p?.headline && p?.headline.trim()) ? p?.headline : "-"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
          
          {visibleUsers.length === 0 && (
            <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography align="center" color="text.secondary">
                  {users.length === 0 ? 'No users found.' : 'No matches for your search.'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      ) : (
        /* Desktop Table View */
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', minWidth: 800 }}>
            <Table>
              <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                <TableRow sx={{backgroundColor: green[500], color: 'white'}}>
                  <TableCell sx={{color: 'white'}}>Name</TableCell>
                  <TableCell sx={{color: 'white'}}>Email</TableCell>
                  <TableCell sx={{color: 'white'}}>Role</TableCell>
                  <TableCell sx={{color: 'white'}}>Headline</TableCell>
                  <TableCell align="right" sx={{color: 'white'}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.map((item, index) => {
                  const u = item?.user as BasicUserInfo | undefined;
                  const p = item?.profile as BasicProfileInfo | null | undefined;
                  return (
                    <TableRow key={u?._id || index} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={(p?.profileImage as string) || undefined}
                            alt={u?.name || "User"}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography variant="body2">{u?.name ?? "-"}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{u?.email ?? "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={u?.role ?? "-"}
                          size="small"
                          color={u?.role?.toLowerCase() === 'admin' ? 'primary' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{(p?.headline && p?.headline.trim()) ? p?.headline : "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete user">
                          <IconButton aria-label="delete" color="error" onClick={() => u && promptDelete(u)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visibleUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {users.length === 0 ? 'No users found.' : 'No matches for your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {userToDelete?.name ?? 'this user'} and all related data?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={deleting}>Cancel</Button>
          <Button
            onClick={() => userToDelete?._id && handleDelete(userToDelete._id)}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UsersPage;