import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError('שגיאה בשליחת הטופס. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

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
              <Link to="/about"><Button variant="outline">אודות</Button></Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">שלח לנו הודעה</CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>שם מלא *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <Label>אימייל *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    data-testid="contact-email"
                  />
                </div>

                <div>
                  <Label>טלפון *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    data-testid="contact-phone"
                  />
                </div>

                <div>
                  <Label>נושא</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    data-testid="contact-subject"
                  />
                </div>

                <div>
                  <Label>הודעה *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    required
                    data-testid="contact-message"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading} data-testid="contact-submit">
                  {loading ? 'שולח...' : 'שלח הודעה'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>פרטי התקשרות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📧</div>
                  <div>
                    <p className="font-semibold">אימייל</p>
                    <a href="mailto:hazon.pro@gmail.com" className="text-blue-600 hover:underline">
                      hazon.pro@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">📞</div>
                  <div>
                    <p className="font-semibold">טלפון</p>
                    <p className="text-gray-600">השאר פרטים ונחזור אליך</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">🕐</div>
                  <div>
                    <p className="font-semibold">שעות פעילות</p>
                    <p className="text-gray-600">ראשון - חמישי: 9:00 - 18:00</p>
                    <p className="text-gray-600">שישי: 9:00 - 13:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">צריך עזרה מיידית?</h3>
                <p className="text-gray-700 mb-4">
                  השאר פרטים בטופס ונחזור אליך בהקדם האפשרי!
                </p>
                <p className="text-sm text-gray-600">
                  ⚡ זמן תגובה ממוצע: פחות מ-24 שעות
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;