// components/admin/AdminUserList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'; // Assuming Shadcn UI select
import { Button } from '../ui/button'; // Assuming Shadcn UI button
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'; // Assuming Shadcn UI table
import { toast } from 'react-hot-toast'; // For notifications

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.auth.token); // Get token for auth headers

    // --- Fetch Users ---
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data.users || []);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError(err.response?.data?.message || 'Failed to load users.');
                toast.error(err.response?.data?.message || 'Failed to load users.');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token]);

    // --- Handle Role Change ---
    const handleRoleChange = async (userId, newRole) => {
        // Find the specific user and show a local loading state maybe?
        // Or disable the select while processing
         console.log(`Attempting to change role for user ${userId} to ${newRole}`);
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Update the user's role in the local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, role: newRole } : user
                    )
                );
                toast.success(response.data.message || 'Role updated successfully!');
            } else {
                 throw new Error(response.data.message || 'Failed to update role');
            }
        } catch (err) {
            console.error("Failed to update role:", err);
            toast.error(err.message || 'Could not update role.');
             // Optionally revert local state change if needed
        }
    };


    if (isLoading) return <div className="p-4 text-center text-gray-400">Loading users...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Change Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{`${user.name.first} ${user.name.last}`}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-600'}`}>{user.role}</span></TableCell>
                            <TableCell>
                                <Select
                                    defaultValue={user.role}
                                    onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                                >
                                    <SelectTrigger className="w-[120px] bg-gray-700 border-gray-600">
                                        <SelectValue placeholder="Change role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-700 text-white border-gray-600">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {users.length === 0 && <p className="text-center py-4 text-gray-500">No users found.</p>}
        </div>
    );
};

export default AdminUserList;