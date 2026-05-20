import { FaArrowUpLong } from "react-icons/fa6";
import { useState, useEffect } from "react";

export default function InfoCard({
  icon,
  title,
  number,
  description,
  isArrow,
  gradient = "from-gray-400 to-gray-600",
}) {
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
      }
    };
    
    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  return (
    <div className={`relative overflow-hidden flex flex-col gap-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-[1px] border-r-4 border-r-transparent px-3 py-4 rounded-2xl shadow-[0_0_4px_0_rgba(0,0,0,0.25)] w-full max-w-[300px] mx-auto sm:max-w-none sm:mx-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Gradient Border Top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      
      <div className="flex justify-center items-center gap-3">
        <h2 className={`${isDark ? "text-gray-200" : "text-[rgba(83,74,64,1)]`} font-medium text-xl xl:text-2xl`}>
          {title}
        </h2>
        <div className={`p-2 rounded-full bg-gradient-to-br ${gradient} shadow-md`}>
          <img src={icon} alt={title} className="w-6 h-6 object-contain filter brightness-0 invert" />
        </div>
      </div>
      <p
        className={`flex justify-center xl:justify-start xl:pr-12 font-bold text-3xl ${isDark ? "text-white" : "text-gray-800"}`}
        dir="rtl"
      >
        {number}
      </p>
      {isArrow ? (
        <div className="flex justify-center xl:justify-end xl:pr-10 text-[rgba(77,204,49,1)] text-sm">
          <p dir="rtl">{description}</p>
          <FaArrowUpLong />
        </div>
      ) : (
        <div className="flex justify-center xl:justify-end xl:pr-10">
          <p className="text-[rgba(77,204,49,1)] text-sm" dir="rtl">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}