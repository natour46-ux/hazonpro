import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import AdminLogin from "@/pages/AdminLogin";
import Signup from "@/pages/Signup";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPanel from "@/pages/AdminPanel";
import ProductsManagement from "@/pages/ProductsManagement";
import CategoriesManagement from "@/pages/CategoriesManagement";
import PromotionsManagement from "@/pages/PromotionsManagement";
import OrdersManagement from "@/pages/OrdersManagement";
import PublicHome from "@/pages/PublicHome";
import PublicProducts from "@/pages/PublicProducts";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/CartPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import { CartProvider } from "@/context/CartContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/products" element={<PublicProducts />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          
          {/* Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Panel with nested routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="promotions" element={<PromotionsManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
