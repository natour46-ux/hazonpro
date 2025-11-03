import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { orderId, total, customerEmail } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
              🛡️
            </div>
            <h1 className="text-2xl font-bold text-gray-900">חזון מערכות אבטחה</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-8xl mb-6">✓</div>
        <h1 className="text-4xl font-bold text-green-600 mb-4">ההזמנה התקבלה בהצלחה!</h1>
        <p className="text-xl text-gray-700 mb-8">תודה שבחרת בחזון מערכות אבטחה</p>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="space-y-4 text-right">
              <div className="border-b pb-4">
                <p className="text-gray-600">מספר הזמנה</p>
                <p className="text-2xl font-bold">#{orderId || 'XXXX'}</p>
              </div>

              {total && (
                <div className="border-b pb-4">
                  <p className="text-gray-600">סכום לתשלום</p>
                  <p className="text-2xl font-bold text-blue-600">₪{total.toFixed(2)}</p>
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg mb-3">השלבים הבאים:</h3>
                <ul className="text-right space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>✉️</span>
                    <span>נשלח אליך אישור הזמנה למייל בקרוב</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📞</span>
                    <span>נציג יצור איתך קשר לאישור פרטי ההזמנה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📦</span>
                    <span>נתחיל בהכנת המשלוח שלך</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🚚</span>
                    <span>המוצרים יישלחו אליך בהקדם האפשרי</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Link to="/products">
              <Button size="lg">המשך לקנות</Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">חזרה לדף הבית</Button>
            </Link>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">שאלות? צריך עזרה?</h3>
              <p className="text-gray-700 mb-3">אנחנו כאן בשבילך!</p>
              <div className="flex gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="outline">צור קשר</Button>
                </Link>
                <a href="mailto:hazon.pro@gmail.com">
                  <Button variant="outline">📧 hazon.pro@gmail.com</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
