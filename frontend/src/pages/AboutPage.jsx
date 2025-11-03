import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AboutPage = () => {
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
              <Link to="/products"><Button variant="outline">מוצרים</Button></Link>
              <Link to="/cart"><Button variant="outline">🛒 סל קניות</Button></Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">אודות חזון מערכות אבטחה</h1>

        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">מי אנחנו</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              חזון מערכות אבטחה היא חברה מובילה בתחום פתרונות האבטחה והתקשורת בישראל. 
              אנו מתמחים באספקה והתקנה של מערכות אבטחה מתקדמות, מצלמות אבטחה, מערכות אזעקה, 
              אינטרקום, מוצרי תקשורת ומנועים חשמליים.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              עם ניסיון של שנים בענף, אנו מספקים שירות מקצועי ואמין ללקוחותינו, תוך שימוש 
              בטכנולוגיות המתקדמות ביותר בשוק.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">התחום שלנו</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">📷 מצלמות אבטחה</h3>
                <p className="text-gray-700">
                  אנו מציעים מגוון רחב של מצלמות אבטחה - מצלמות IP, מצלמות אנלוגיות, 
                  מצלמות כיפה, צינור ועוד. כולל מערכות DVR ו-NVR לתיעוד ושמירת חומרים.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">🚨 מערכות אזעקה</h3>
                <p className="text-gray-700">
                  מערכות אזעקה חכמות, אלחוטיות וקוויות מהמותגים המובילים בעולם. 
                  כולל חיישני תנועה, מגעים, שלטים וממשקי ניהול מתקדמים.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">📞 אינטרקום ותקשורת</h3>
                <p className="text-gray-700">
                  מערכות אינטרקום מודרניות עם וידאו, מערכות תקשורת פנימית, 
                  ופתרונות בקרת כניסה לבניינים ומתקנים.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">⚡ מנועים חשמליים</h3>
                <p className="text-gray-700">
                  מנועים לשערים, תריסים וחניונים. כולל מערכות בקרה ושלטים רחוק.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">למה לבחור בנו?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="font-bold mb-2">ניסיון רב שנים</h3>
                <p className="text-gray-600">מומחיות וידע מקצועי בתחום</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold mb-2">מוצרים מובילים</h3>
                <p className="text-gray-600">רק מהמותגים הטובים בעולם</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🛠️</div>
                <h3 className="font-bold mb-2">שירות מקצועי</h3>
                <p className="text-gray-600">תמיכה מלאה והתקנה מקצועית</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Link to="/contact">
            <Button size="lg" className="text-lg px-8 py-6">
              צור קשר איתנו
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;