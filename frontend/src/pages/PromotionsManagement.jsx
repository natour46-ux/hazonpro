import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: 0,
    start_date: '',
    end_date: '',
    product_ids: [],
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [promosRes, productsRes] = await Promise.all([
        axios.get(`${API}/admin/promotions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPromotions(promosRes.data);
      setProducts(productsRes.data);
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
    const promoData = {
      ...formData,
      discount_percent: parseFloat(formData.discount_percent),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString()
    };

    try {
      if (editingPromotion) {
        await axios.put(`${API}/admin/promotions/${editingPromotion.id}`, promoData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/promotions`, promoData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowDialog(false);
      setEditingPromotion(null);
      setFormData({
        title: '',
        description: '',
        discount_percent: 0,
        start_date: '',
        end_date: '',
        product_ids: [],
        is_active: true
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בשמירת מבצע');
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description || '',
      discount_percent: promotion.discount_percent,
      start_date: new Date(promotion.start_date).toISOString().split('T')[0],
      end_date: new Date(promotion.end_date).toISOString().split('T')[0],
      product_ids: promotion.product_ids || [],
      is_active: promotion.is_active
    });
    setShowDialog(true);
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מבצע זה?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/admin/promotions/${promoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      setError('שגיאה במחיקת מבצע');
    }
  };

  const isPromotionActive = (promo) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);
    return promo.is_active && now >= start && now <= end;
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ניהול מבצעים</CardTitle>
            <Button onClick={() => {
              setEditingPromotion(null);
              setFormData({
                title: '',
                description: '',
                discount_percent: 0,
                start_date: '',
                end_date: '',
                product_ids: [],
                is_active: true
              });
              setShowDialog(true);
            }} data-testid="add-promotion-btn">
              + הוסף מבצע
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
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">אחוז הנחה</TableHead>
                <TableHead className="text-right">תאריך התחלה</TableHead>
                <TableHead className="text-right">תאריך סיום</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id} data-testid={`promotion-${promotion.id}`}>
                  <TableCell className="font-medium">{promotion.title}</TableCell>
                  <TableCell>{promotion.discount_percent}%</TableCell>
                  <TableCell>{new Date(promotion.start_date).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>{new Date(promotion.end_date).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell>
                    <Badge variant={isPromotionActive(promotion) ? 'default' : 'secondary'}>
                      {isPromotionActive(promotion) ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(promotion)} data-testid={`edit-promotion-${promotion.id}`}>
                        ערוך
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(promotion.id)} data-testid={`delete-promotion-${promotion.id}`}>
                        מחק
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promotions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    אין מבצעים. לחץ על "הוסף מבצע" להתחלה.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'עריכת מבצע' : 'הוספת מבצע'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>שם המבצע *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                data-testid="promotion-title"
              />
            </div>

            <div>
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2}
                data-testid="promotion-description"
              />
            </div>

            <div>
              <Label>אחוז הנחה (%) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.discount_percent}
                onChange={(e) => setFormData({...formData, discount_percent: e.target.value})}
                required
                data-testid="promotion-discount"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>תאריך התחלה *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                  data-testid="promotion-start-date"
                />
              </div>
              <div>
                <Label>תאריך סיום *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                  data-testid="promotion-end-date"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_promo"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                data-testid="promotion-active"
              />
              <Label htmlFor="is_active_promo">מבצע פעיל</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
              <Button type="submit" data-testid="save-promotion-btn">
                {editingPromotion ? 'עדכן' : 'הוסף'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionsManagement;