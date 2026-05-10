import { Navigate, Route, Routes } from "react-router-dom";

import LogIn from "./Pages/LogIn/LogIn";
import DashBoardLayout from "./MainLayout/DashBoardLayOut";
import Home from "./Pages/Home/Home";
import Product from "./Pages/Product/Product";
import ProductDetail from "./Pages/Product/ProductDetail";
import Images from "./Pages/Images/Images";
import Contacts from "./Pages/Contacts/Contacts";
import SocialLinks from "./Pages/SocialLinks/SocialLinks";
import Services from "./Pages/Services/Services";
import Branches from "./Pages/Branches/Branches";
import BranchDetail from "./Pages/Branches/BranchDetail";
import ProtectedRoute from "./Routes/ProtectedRoute";
import AdminProfile from "./Pages/Admin/AdminProfile";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashBoardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="branches" element={<Branches />} />
        <Route path="branches/:id" element={<BranchDetail />} />
        <Route path="products" element={<Product />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="images" element={<Images />}/>
        <Route path="messages" element={<Contacts />}/>
        <Route path="services" element={<Services/>}/>
        <Route path="social-links" element={<SocialLinks />}/>
        <Route path="admin" element={<AdminProfile />}/>
      </Route>
    </Routes>
  );
}
export default App;
