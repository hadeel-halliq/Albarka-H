import { FaBars } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { FiImage } from "react-icons/fi";
import { FiMail } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { FiSun, FiMoon } from "react-icons/fi";
import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/apiServices";
import { useTheme } from "../../hooks/useTheme";

import logo2 from "../../images/logo2.png";
import market from "../../images/market.png";
import orangePen from "../../images/orangePen.png";

export default function DashboardHeader() {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [adminName, setAdminName] = useState("مرحبا");
  const location = useLocation();
  const iconStyle = "text-3xl cursor-pointer text-primary";

  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const data = await authService.getProfile();
        if (data?.admin?.name) {
          setAdminName(`مرحبا ${data.admin.name}`);
        } else if (data?.name) {
          setAdminName(`مرحبا ${data.name}`);
        }
      } catch (error) {
        console.error("فشل جلب اسم الأدمن:", error);
      }
    };
    fetchAdminName();
  }, []);

  const titles = {
    "/home": {
      text: "نظرة عامة",
      image: market,
      isImage: true,
    },
    "/products": {
      text: "إدارة المنتجات",
      image: orangePen,
      isImage: true,
    },
    "/images": {
      text: "إدارة الصور",
      icon: FiImage,
    },
    "/messages": {
      text: "إدارة الرسائل",
      icon: FiMail,
    },
    "/services": {
      text: "إدارة الخدمات ",
      icon: FiSettings,
    },
    "/locations": {
      text: "إدارة المراكز",
      icon: FiMapPin,
    },
    "/social-links": {
      text: "روابط التواصل",
      icon: FiGlobe,
    },
  };

  const mainTitle = titles[location.pathname]; 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  return (
    <div
      className={`w-full py-4 sticky top-0 z-50 transition-colors duration-300 ${
        isDark ? "bg-[rgba(26,26,46,1)]" : "bg-[rgba(255,248,235,1)]"
      } ${
        isScrolled ? "shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]" : "shadow-none "
      }`}
    >
      <div className="container mx-auto px-6 overflow-hidden flex justify-between items-center">
        <div className="flex justify-center items-center gap-2">
          <div className="flex gap-3 items-start font-bold text-xl">
            <Link to="/">
              <img src={logo2} alt="circleIcon" className="w-[50px]" />
            </Link>
            <h2 className={`hidden xl:block ${isDark ? "text-white" : "text-gray-800"}`}>{adminName}</h2>
          </div>
          <div className="xl:hidden">
            <button onClick={handleClick}>
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <Motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IoClose className={iconStyle} />
                  </Motion.div>
                ) : (
                  <Motion.div
                    key="bars"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaBars className={iconStyle} />
                  </Motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {mainTitle && (
          <div className="flex justify-center items-center gap-2">
            <h2 className={`font-bold text-2xl ${isDark ? "text-white" : "text-gray-800"}`}>{mainTitle.text}</h2>
            {mainTitle.isImage ? (
              <img src={mainTitle.image} alt={mainTitle.text} />
            ) : (
              <mainTitle.icon className="w-[24px] h-[24px] text-primary" />
            )}
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${
            isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <FiSun className="w-6 h-6 text-primary" />
          ) : (
            <FiMoon className="w-6 h-6 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
}
