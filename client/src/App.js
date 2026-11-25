import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PendingOwners from "./pages/Admin/PendingOwners";
import ApprovedOwners from "./pages/Admin/ApprovedOwners";

import CustomerStats from "./pages/Admin/CustomerStats";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedOwnerRoute from "./components/ProtectedOwnerRoute";

import OwnerDashboard from "./pages/Owner/OwnerDashboard";
import OwnerLogin from "./pages/Owner/OwnerLogin";


import OrganizationLogin from "./pages/Owner/OrganizationLogin";
import OrganizationDashboard from "./pages/Owner/OrganizationDashboard";




import CustomerLogin from "./pages/Customer/CustomerLogin";
import CustomerOTP from "./pages/Customer/CustomerOTP";
import ScanOwner from "./pages/Customer/ScanOwner";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";


import StaffLogin from "./components/StaffLogin";
import StaffDashboard from "./components/StaffDashboard";
import ProtectedStaffRoute from "./components/ProtectedStaffRoute";




import CustomerProfile from "./pages/Customer/CustomerProfile";


import CustomerForgotPassword from "./pages/Customer/CustomerForgotPassword";

import SignupPage from "./components/SignupPage";
import Leave from "./components/Leave";

import Salary from "./components/Salary";

import OwnerForgotPassword from "./pages/Owner/OwnerForgotPassword";

import SubscriptionRevenue from "./pages/Admin/SubscriptionRevenue";


import OwnerStatusManagement from "./pages/Admin/OwnerStatusManagement";

import { useEffect } from "react";
import { requestNotificationPermission } from "./requestNotificationPermission";




function App() {
   useEffect(() => {
  requestNotificationPermission();

  
}, []);
  return (
    <BrowserRouter>
      <Routes>

        {/* OWNER */}
        <Route path="/owner-login" element={<OwnerLogin />} />

        <Route 
          path="/owner-dashboard"
          element={
            <ProtectedOwnerRoute>
              <OwnerDashboard />
            </ProtectedOwnerRoute>
          }
        />

        {/* CUSTOMER */}
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-otp" element={<CustomerOTP />} />

        <Route
  path="/customer-forgot-password"
  element={<CustomerForgotPassword />}
/>

        <Route 
          path="/customer-scan"
          element={
            <ProtectedCustomerRoute>
              <ScanOwner />
            </ProtectedCustomerRoute>
          }
        />

        <Route 
          path="/customer-dashboard/"
          element={
            <ProtectedCustomerRoute>
              <CustomerDashboard />
            </ProtectedCustomerRoute>
          }
        />


        {/* LANDING */}
        <Route path="/" element={<LandingPage />} />
        <Route
  path="/signup"
  element={<SignupPage />}
/>

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />

        <Route
          path="/admin/pending"
          element={
            <ProtectedAdminRoute>
              <PendingOwners />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/approved"
          element={
            <ProtectedAdminRoute>
              <ApprovedOwners />
            </ProtectedAdminRoute>
          }
        />

        <Route
  path="/admin/customer-stats"
  element={
    <ProtectedAdminRoute>
      <CustomerStats />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/subscription-revenue"
  element={
    <ProtectedAdminRoute>
      <SubscriptionRevenue />
    </ProtectedAdminRoute>
  }
/>

        {/* STAFF */}
<Route path="/staff-login" element={<StaffLogin />} />

<Route
  path="/staff-dashboard"
  element={
    <ProtectedStaffRoute>
      <StaffDashboard />
    </ProtectedStaffRoute>
  }
/>


<Route 
  path="/customer/profile"
  element={
    <ProtectedCustomerRoute>
      <CustomerProfile />
    </ProtectedCustomerRoute>
  }
/>





{/* ORGANIZATION */}

<Route
path="/organization-login"
element={<OrganizationLogin />}
/>

<Route
path="/organization-dashboard"
element={<OrganizationDashboard />}
/>


<Route path="/staff-leave" element={<Leave />} />
<Route path="/staff-salary" element={<Salary />} />



<Route
  path="/owner-forgot-password"
  element={<OwnerForgotPassword />}
/>

<Route
  path="/admin/owner-status-management"
  element={
    <ProtectedAdminRoute>
      <OwnerStatusManagement />
    </ProtectedAdminRoute>
  }
/>

      



      </Routes>
    </BrowserRouter>
  );
}

export default App;
