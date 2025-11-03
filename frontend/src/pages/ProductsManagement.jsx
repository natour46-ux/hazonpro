import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    sale_price: 0,
    category_id: '',
    stock: 0,
    is_active: true,
    images: []
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/categories`)
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await axios.post(`${API}/admin/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('token');
    let imageUrl = formData.images[0] || '';
    
    // Upload new image if selected
    if (imageFile) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock: parseInt(formData.stock),
      images: imageUrl ? [imageUrl] : []
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowDialog(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        sale_price: 0,
        category_id: '',
        stock: 0,
        is_active: true,
        images: []
      });
      setImageFile(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'שגיאה בשמירת מוצר');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      sale_price: product.sale_price || 0,
      category_id: product.category_id,
      stock: product.stock,
      is_active: product.is_active,
      images: product.images || []
    });
    setShowDialog(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      setError('שגיאה במחיקת מוצר');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'לא מוגדר';
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ניהול מוצרים</CardTitle>
            <Button onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: 0,
                sale_price: 0,
                category_id: '',
                stock: 0,
                is_active: true,
                images: []
              });
              setShowDialog(true);
            }} data-testid="add-product-btn">
              + הוסף מוצר חדש
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
                <TableHead className="text-right">תמונה</TableHead>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">קטגוריה</TableHead>
                <TableHead className="text-right">מחיר</TableHead>
                <TableHead className="text-right">מלאי</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} data-testid={`product-${product.id}`}>
                  <TableCell>
                    {product.images && product.images[0] ? (
                      <img src={`${BACKEND_URL}${product.images[0]}`} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">אין תמונה</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryName(product.category_id)}</TableCell>
                  <TableCell>
                    {product.sale_price ? (
                      <div>
                        <span className="line-through text-gray-400">₪{product.price}</span>
                        <span className="text-red-600 font-bold mr-2">₪{product.sale_price}</span>
                      </div>
                    ) : (
                      <span>₪{product.price}</span>
                    )}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(product)} data-testid={`edit-product-${product.id}`}>
                        ערוך
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} data-testid={`delete-product-${product.id}`}>
                        מחק
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    אין מוצרים. לחץ על "הוסף מוצר חדש" להתחלה.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>שם המוצר *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                data-testid="product-name"
              />
            </div>

            <div>
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                data-testid="product-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מחיר *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  data-testid="product-price"
                />
              </div>
              <div>
                <Label>מחיר מבצע</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                  data-testid="product-sale-price"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>קטגוריה *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})} required>
                  <SelectTrigger data-testid="product-category">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>מלאי *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                  data-testid="product-stock"
                />
              </div>
            </div>

            <div>
              <Label>תמונת מוצר</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                data-testid="product-image"
              />
              {formData.images && formData.images[0] && (
                <img src={`${BACKEND_URL}${formData.images[0]}`} alt="תמונה נוכחית" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                data-testid="product-active"
              />
              <Label htmlFor="is_active">מוצר פעיל</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
              <Button type="submit" data-testid="save-product-btn">
                {editingProduct ? 'עדכן' : 'הוסף'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;