import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiGlobe } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { FiBox } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { LuMessageSquare } from "react-icons/lu";
import { useEffect, useState } from "react";

import DashboardMenu from "./DashboardMenu";
import SidebarHeader from "./SidebarHeader";


export default function SideBar({ isOpen, stats }) {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      } else {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };
    
    window.addEventListener("storage", handleThemeChange);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkMode = document.documentElement.classList.contains("dark");
          setIsDark(isDarkMode);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      window.removeEventListener("storage", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const links = [
    { name: "الصفحة الرئيسية", icon: AiOutlineHome, to: "/" },
    { name: "ادارة الحساب", icon: FiUser, to: "/admin"},
    { name: "إدارة الفروع", icon: FiMapPin, to: "/branches" },
    { name: "إدارة المنتجات", icon:  FiBox, to: "/products"},
    { name: "إدارة الصور", icon: CiImageOn, to: "/images"},
    { name: "إدارة الرسائل", icon: LuMessageSquare, to: "/messages" },
    { name: "إدارة الخدمات", icon: FiSettings, to: "/services"},
    { name: "روابط التواصل", icon: FiGlobe, to: "/social-links"},
  ];
  
  const allLinks = [...links];
  
  return (
    <>
      <div className={`hidden fixed xl:flex flex-col bg-white text-gray-800 p-4 h-full shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] z-100 `}>
        <SidebarHeader/>
        <DashboardMenu links={allLinks}/>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            key="sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
            className={`fixed right-0 top-0 h-full w-54 bg-white shadow-lg p-4 flex flex-col z-50 xl:hidden`}
          >
            <SidebarHeader/>
            <DashboardMenu links={allLinks} />
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}