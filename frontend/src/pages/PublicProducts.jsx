import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const categoriesRes = await axios.get(`${API}/categories`);
      setCategories(categoriesRes.data);
      
      const categoryId = searchParams.get('category');
      await fetchProducts(categoryId || 'all');
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const url = categoryId && categoryId !== 'all' 
        ? `${API}/products?category_id=${categoryId}`
        : `${API}/products`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'ללא קטגוריה';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                🛡️
              </div>
              <h1 className="text-2xl font-bold text-gray-900">חזון מערכות אבטחה</h1>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline">כניסה למערכת</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">סנן לפי קטגוריה:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory === 'all' ? 'כל המוצרים' : getCategoryName(selectedCategory)}
            <span className="text-gray-500 text-base mr-2">({products.length} מוצרים)</span>
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">אין מוצרים בקטגוריה זו</p>
              <Link to="/admin/login">
                <Button>היכנס למערכת להוספת מוצרים</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img 
                          src={`${BACKEND_URL}${product.images[0]}`} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <Badge className="mb-2 w-fit">{getCategoryName(product.category_id)}</Badge>
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 flex-1">
                        {product.description ? product.description.substring(0, 80) + '...' : 'אין תיאור'}
                      </p>
                      <div className="flex items-center justify-between">
                        {product.sale_price ? (
                          <div className="flex flex-col">
                            <span className="text-sm line-through text-gray-400">₪{product.price}</span>
                            <span className="text-2xl font-bold text-red-600">₪{product.sale_price}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">₪{product.price}</span>
                        )}
                        {product.stock > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">במלאי</Badge>
                        ) : (
                          <Badge variant="destructive">אזל מהמלאי</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProducts;