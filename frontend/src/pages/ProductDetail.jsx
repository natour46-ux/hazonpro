import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, getCartCount } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
      
      // Fetch category details
      const categoriesRes = await axios.get(`${API}/categories`);
      const cat = categoriesRes.data.find(c => c.id === response.data.category_id);
      setCategory(cat);
    } catch (err) {
      setError('מוצר לא נמצא');
      console.error('Error fetching product:', err);
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4" dir="rtl">
        <p className="text-xl text-red-600">{error || 'מוצר לא נמצא'}</p>
        <Button onClick={() => navigate('/products')}>חזרה למוצרים</Button>
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
            <div className="flex gap-4">
              <Link to="/cart" className="relative">
                <Button>🛒 סל ({getCartCount()})</Button>
              </Link>
              <Link to="/products">
                <Button variant="outline">← חזרה למוצרים</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img 
                      src={`${BACKEND_URL}${product.images[0]}`} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-8xl">
                      📦
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {category && (
              <Badge className="text-base px-4 py-1">
                {category.icon} {category.name}
              </Badge>
            )}

            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <span className="text-5xl font-bold text-red-600">₪{product.sale_price}</span>
                  <span className="text-2xl line-through text-gray-400">₪{product.price}</span>
                  <Badge variant="destructive" className="text-base">
                    חסכון {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  </Badge>
                </>
              ) : (
                <span className="text-5xl font-bold text-blue-600">₪{product.price}</span>
              )}
            </div>

            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-base px-4 py-2">
                  ✓ במלאי - {product.stock} יחידות
                </Badge>
              </div>
            ) : (
              <Badge variant="destructive" className="text-base px-4 py-2">
                אזל מהמלאי
              </Badge>
            )}

            {product.description && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">תיאור המוצר</h2>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">כמות:</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                  <Button 
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg py-6"
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(product, quantity);
                  navigate('/cart');
                }}
              >
                {product.stock > 0 ? '🛒 הוסף לסל' : 'אזל מהמלאי'}
              </Button>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-sm font-medium">איכות מובטחת</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">🚚</div>
                  <p className="text-sm font-medium">משלוח מהיר</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl mb-2">🛠️</div>
                  <p className="text-sm font-medium">תמיכה מקצועית</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
