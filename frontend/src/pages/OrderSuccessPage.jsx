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
                <h3 className="font-bold text-lg mb-3">מה הלאה?</h3>
                <ul className="text-right space-y-3 text-gray-700">
                  <li className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl">✅</span>
                    <div>
                      <strong>ההזמנה נשלחה!</strong>
                      <p className="text-sm">פרטי ההזמנה נשלחו אליך למייל {customerEmail && `(${customerEmail})`}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-2xl">📧</span>
                    <div>
                      <strong>קיבלנו את פרטיך</strong>
                      <p className="text-sm">המייל נשלח גם אלינו ואנחנו כבר מטפלים בהזמנה</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-2xl">📞</span>
                    <div>
                      <strong>נחזור אליך בהקדם</strong>
                      <p className="text-sm">נציג יצור איתך קשר תוך 24 שעות לאישור ההזמנה</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <strong>הכנת משלוח</strong>
                      <p className="text-sm">לאחר האישור נתחיל להכין את המוצרים למשלוח</p>
                    </div>
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
