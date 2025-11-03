import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const subtotal = getCartTotal();
  const shippingCost = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingCost;

  const [formData, setFormData] = useState({
    // Customer Info
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    notes: '',
    
    // Payment
    paymentMethod: 'cash', // cash, bank_transfer, bit, credit_card
    
    // Credit Card (if selected)
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardHolderID: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate payment method specific fields
    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVV || !formData.cardHolderID) {
        setError('נא למלא את כל פרטי כרטיס האשראי');
        setLoading(false);
        return;
      }
    }

    try {
      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        shipping_address: formData.shippingAddress,
        city: formData.city,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.sale_price || item.price
        })),
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        status: 'pending'
      };

      const response = await axios.post(`${API}/orders`, orderData);
      
      // Clear cart only after order is confirmed and emails sent
      clearCart();
      navigate('/order-success', { state: { orderId: response.data.id, total, customerEmail: formData.customerEmail } });
    } catch (err) {
      setError('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                🛡️
              </div>
              <h1 className="text-2xl font-bold text-gray-900">חזון מערכות אבטחה</h1>
            </Link>
            <Link to="/cart"><Button variant="outline">← חזרה לסל</Button></Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">השלמת הזמנה</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי הלקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>שם מלא *</Label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>אימייל *</Label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>טלפון *</Label>
                      <Input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>עיר *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>כתובת משלוח מלאה *</Label>
                    <Textarea
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <Label>הערות להזמנה</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      placeholder="הוראות מיוחדות, בקשות נוספות..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>אמצעי תשלום</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                    {/* Cash */}
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💵</span>
                          <div>
                            <p className="font-bold">תשלום במזומן</p>
                            <p className="text-sm text-gray-600">תשלום במזומן בעת קבלת המוצר</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏦</span>
                          <div className="flex-1">
                            <p className="font-bold">העברה בנקאית</p>
                            <p className="text-sm text-gray-600">העבר לחשבון:</p>
                            <div className="text-sm bg-blue-50 p-2 rounded mt-2">
                              <p><strong>בנק הפועלים (12)</strong></p>
                              <p>סניף: <strong>665</strong></p>
                              <p>מס' חשבון: <strong>224471</strong></p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Bit */}
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="bit" id="bit" />
                      <Label htmlFor="bit" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📱</span>
                          <div>
                            <p className="font-bold">העברת Bit</p>
                            <p className="text-sm text-gray-600">העבר דרך אפליקציית Bit - פרטים יישלחו במייל</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Credit Card */}
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💳</span>
                          <div className="flex-1">
                            <p className="font-bold">כרטיס אשראי</p>
                            <p className="text-sm text-gray-600">תשלום מאובטח בכרטיס אשראי</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Credit Card Fields */}
                  {formData.paymentMethod === 'credit_card' && (
                    <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-bold">פרטי כרטיס אשראי</h3>
                      
                      <div>
                        <Label>מספר כרטיס *</Label>
                        <Input
                          type="text"
                          maxLength="19"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '');
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                            setFormData({...formData, cardNumber: formatted});
                          }}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>תוקף (MM/YY) *</Label>
                          <Input
                            type="text"
                            maxLength="5"
                            placeholder="12/25"
                            value={formData.cardExpiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setFormData({...formData, cardExpiry: value});
                            }}
                            required
                          />
                        </div>
                        <div>
                          <Label>CVV *</Label>
                          <Input
                            type="text"
                            maxLength="3"
                            placeholder="123"
                            value={formData.cardCVV}
                            onChange={(e) => setFormData({...formData, cardCVV: e.target.value.replace(/\D/g, '')})}
                            required
                          />
                        </div>
                        <div>
                          <Label>ת.ז בעל הכרטיס *</Label>
                          <Input
                            type="text"
                            maxLength="9"
                            placeholder="123456789"
                            value={formData.cardHolderID}
                            onChange={(e) => setFormData({...formData, cardHolderID: e.target.value.replace(/\D/g, '')})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>סיכום הזמנה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₪{((item.sale_price || item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>סכום ביניים:</span>
                      <span>₪{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>משלוח:</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-bold' : ''}>
                        {shippingCost === 0 ? 'חינם! 🎉' : `₪${shippingCost}`}
                      </span>
                    </div>

                    {subtotal < 500 && (
                      <p className="text-xs text-gray-600">
                        💡 הוסף עוד ₪{(500 - subtotal).toFixed(2)} למשלוח חינם!
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>סה"כ לתשלום:</span>
                      <span>₪{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'מעבד...' : '✓ אישור והזמנה'}
                  </Button>

                  <div className="text-xs text-center text-gray-600 space-y-1">
                    <p>🔒 תשלום מאובטח ומוצפן</p>
                    <p>🚚 משלוח לכל הארץ</p>
                    <p>📞 שירות לקוחות זמין</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
