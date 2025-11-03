import React from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'ניהול משתמשים', icon: '👥' },
    { path: '/admin/products', label: 'ניהול מוצרים', icon: '📦' },
    { path: '/admin/categories', label: 'ניהול קטגוריות', icon: '🏷️' },
    { path: '/admin/promotions', label: 'ניהול מבצעים', icon: '🎁' },
    { path: '/admin/orders', label: 'ניהול הזמנות', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">מערכת ניהול - {currentUser?.email}</h1>
            </div>
            <div className="flex items-center">
              <Button onClick={handleLogout} variant="outline" size="sm" data-testid="logout-button">
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <Card className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    data-testid={`menu-${item.path}`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;