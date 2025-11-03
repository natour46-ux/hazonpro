import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (err) {
      setError('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('token');
    try {
      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowDialog(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '' });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בשמירת קטגוריה');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      setError('שגיאה במחיקת קטגוריה');
    }
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ניהול קטגוריות</CardTitle>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', icon: '' });
              setShowDialog(true);
            }} data-testid="add-category-btn">
              + הוסף קטגוריה
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">סמל</TableHead>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} data-testid={`category-${category.id}`}>
                  <TableCell className="text-2xl">{category.icon || '📎'}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(category)} data-testid={`edit-category-${category.id}`}>
                        ערוך
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)} data-testid={`delete-category-${category.id}`}>
                        מחק
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    אין קטגוריות. לחץ על "הוסף קטגוריה" להתחלה.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>שם הקטגוריה *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                data-testid="category-name"
              />
            </div>

            <div>
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                data-testid="category-description"
              />
            </div>

            <div>
              <Label>סמל (emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="📷"
                data-testid="category-icon"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
              <Button type="submit" data-testid="save-category-btn">
                {editingCategory ? 'עדכן' : 'הוסף'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;