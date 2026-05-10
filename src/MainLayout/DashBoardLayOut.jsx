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
    <div className="">
      <div className="grid grid-cols-1 xl:grid-cols-14">
        <div className="xl:col-span-11 order-1 xl:order-1">
          <DashboardHeader isOpen={isOpen} handleClick={handleClick} />
          <Outlet />
        </div>

        <div className="xl:col-span-3 order-2 xl:order-2">
          <SideBar isOpen={isOpen} handleClick={handleClick} />
        </div>
      </div>
    </div>
  );
}