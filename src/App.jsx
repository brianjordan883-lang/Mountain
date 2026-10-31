import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/chat/ChatBot";
import ToastContainer from "./components/ui/ToastContainer";
import PrivateRoute from "./components/layout/PrivateRoute";
import Home from "./pages/Home";
import CottagesPage from "./pages/CottagesPage";
import CottageDetails from "./pages/CottageDetails";
import BookingPage from "./pages/BookingPage";
import GalleryPage from "./pages/GalleryPage";
import Contacts from "./pages/Contacts";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookings from "./pages/MyBookings";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCottagesPage from "./pages/admin/AdminCottagesPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminContent from "./pages/admin/AdminContent";

function ScrollTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
      return () => clearTimeout(id);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cottages" element={<CottagesPage />} />
          <Route path="/cottages/:slug" element={<CottageDetails />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="cottages" element={<AdminCottagesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="content" element={<AdminContent />} />
          </Route>
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
      <ToastContainer />
    </>
  );
}
