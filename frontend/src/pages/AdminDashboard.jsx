import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    setCurrentUser(user);
    fetchUsers(token);
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('שגיאה בטעינת משתמשים');
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/admin/approve/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh users list
      fetchUsers(token);
    } catch (err) {
      setError('שגיאה באישור משתמש');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh users list
      fetchUsers(token);
    } catch (err) {
      setError('שגיאה במחיקת משתמש');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const pendingUsers = users.filter(u => !u.approved && u.role !== 'admin');
  const approvedUsers = users.filter(u => u.approved || u.role === 'admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לוח בקרה - ניהול משתמשים</h1>
            <p className="text-gray-600 mt-2">שלום, {currentUser?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" data-testid="logout-button">
            התנתק
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>משתמשים ממתינים לאישור</CardTitle>
            <CardDescription>
              {pendingUsers.length} משתמשים ממתינים לאישור
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">אין משתמשים ממתינים</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">תאריך הרשמה</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`pending-user-${user.id}`}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">ממתין</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(user.id)}
                            size="sm"
                            data-testid={`approve-user-${user.id}`}
                          >
                            אשר
                          </Button>
                          <Button
                            onClick={() => handleDelete(user.id)}
                            size="sm"
                            variant="destructive"
                            data-testid={`delete-user-${user.id}`}
                          >
                            מחק
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Approved Users */}
        <Card>
          <CardHeader>
            <CardTitle>משתמשים מאושרים</CardTitle>
            <CardDescription>
              {approvedUsers.length} משתמשים מאושרים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">תפקיד</TableHead>
                  <TableHead className="text-right">תאריך הרשמה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`approved-user-${user.id}`}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        <Button
                          onClick={() => handleDelete(user.id)}
                          size="sm"
                          variant="destructive"
                          data-testid={`delete-approved-user-${user.id}`}
                        >
                          מחק
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;