import { Outlet } from "react-router-dom";
import { useState } from "react";

import SideBar from "../Components/Layouts/SideBar";
import DashboardHeader from "../Components/Layouts/DashboardHeader";

export default function DashBoardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-[1fr_250px] min-h-screen bg-[var(--bg-primary)]`}>
      <div className="order-1 xl:order-1">
        <DashboardHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Outlet />
      </div>

      <div className="order-2 xl:order-2">
        <SideBar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
}