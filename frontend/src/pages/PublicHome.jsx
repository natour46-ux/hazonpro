import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCartCount } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
                🛡️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">חזון מערכות אבטחה</h1>
                <p className="text-sm text-gray-600">פתרונות תקשורת ואבטחה מתקדמים</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/about">
                <Button variant="outline">אודות</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">צור קשר</Button>
              </Link>
              <Link to="/products">
                <Button variant="outline">כל המוצרים</Button>
              </Link>
              <Link to="/cart" className="relative">
                <Button>
                  🛒 סל קניות
                  {getCartCount() > 0 && (
                    <Badge className="absolute -top-2 -left-2 bg-red-500">
                      {getCartCount()}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline">כניסה למערכת</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-4">פתרונות תקשורת ואבטחה מתקדמים</h2>
          <p className="text-xl mb-8">ציוד מקצועי למצלמות אבטחה, מערכות אזעקה, אינטרקום ומוצרי תקשורת</p>
          <div className="flex gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                עיון במוצרים
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              צור קשר
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">קטגוריות מוצרים</h2>
          
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">אין קטגוריות זמינות כרגע</p>
              <Link to="/admin/login" className="inline-block mt-4">
                <Button>היכנס למערכת להוספת קטגוריות</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} to={`/products?category=${category.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{category.icon || '📦'}</div>
                        <div>
                          <CardTitle className="text-xl">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{category.description || ''}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">איכות מובטחת</h3>
              <p className="text-gray-600">מוצרים מהמותגים המובילים בעולם</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">משלוח מהיר</h3>
              <p className="text-gray-600">אספקה מהירה לכל רחבי הארץ</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">תמיכה מקצועית</h3>
              <p className="text-gray-600">צוות מומחים לשירותכם</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 חזון מערכות אבטחה. כל הזכויות שמורות.</p>
          <p className="text-sm text-gray-400 mt-2">מערכת ניהול מלאה לאתר e-commerce</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;