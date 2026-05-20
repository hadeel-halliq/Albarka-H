import { Outlet } from "react-router-dom";

import SideBar from "../Components/Layouts/SideBar";
import DashboardHeader from "../Components/Layouts/DashboardHeader";

export default function DashBoardLayout() {
  return (
    <div className={`grid grid-cols-1 xl:grid-cols-[1fr_250px] min-h-screen bg-[var(--bg-primary)]`}>
      <div className="order-1 xl:order-1">
        <DashboardHeader />
        <Outlet />
      </div>

      <div className="order-2 xl:order-2">
        <SideBar />
      </div>
    </div>
  );
}