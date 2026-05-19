import { useState } from "react";
import { Outlet } from "react-router-dom";

import SideBar from "../Components/Layouts/SideBar";
import DashboardHeader from "../Components/Layouts/DashboardHeader";

export default function DashBoardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_250px]">
      <div className="order-1 xl:order-1">
        <DashboardHeader isOpen={isOpen} handleClick={handleClick} />
        <Outlet />
      </div>

      <div className="order-2 xl:order-2">
        <SideBar isOpen={isOpen} handleClick={handleClick} />
      </div>
    </div>
  );
}