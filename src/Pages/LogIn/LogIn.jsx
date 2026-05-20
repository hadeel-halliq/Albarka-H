import * as Yup from "yup";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import icon1 from "../../images/icon1.png";
import Popup from "./Components/Popup";
import { authService, getApiErrorMessage } from "../../services/apiServices";

export default function LogIn() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.title = "لوحة التحكم | تسجيل الدخول"
    
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      } else {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };
    
    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []) 
  
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const validationSchema = Yup.object({
    username: Yup.string().email("صيغة البريد غير صحيحة").required("البريد الإلكتروني مطلوب"),
    password: Yup.string().required("كلمة المرور مطلوبة"),
  });

  const handleLogIn = async (values, { setSubmitting }) => {
    setApiError("");
    try {
      await authService.login(values.username.trim(), values.password);
      // تأكيد نجاح الجلسة/التوكن فعليًا حتى لا يحدث "يدخل ثم يرجع"
      await authService.me();
      navigate("/home");
    } catch (error) {
      setApiError(getApiErrorMessage(error));
      setIsPopupOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${isDark ? "bg-[linear-gradient(to_bottom_left,rgba(26,26,46,1),rgba(20,20,40,1))]" : "bg-[linear-gradient(to_bottom_left,rgba(255,255,255,1),rgba(250,177,71,1))]"} flex flex-col items-center justify-center min-h-screen px-4 py-10 transition-colors duration-300`}>
      <div className={`${isDark ? "bg-[#1f2937] border-gray-600" : "bg-[rgb(255,248,235)] border-primary"} border-[1px] py-10 sm:px-5 rounded-2xl w-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl text-center`}>
        <img src={icon1} className="w-48 sm:w-[200px] md:w-70 lg:w-[350px] lg:h-[210px] mx-auto" alt="icon" />
        <h2 className={`text-lg sm:text-xl md:text-[28px] lg:text-4xl font-bold tracking-wide ${isDark ? "text-white" : "text-[rgba(73,65,58,1)]"} mt-4`}>
          اهلا بك في لوحة التحكم
        </h2>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogIn}
        >
          <Form className="flex flex-col gap-4 mt-6">
            <div>
              <Field
                name="username"
                type="text"
                placeholder="اسم المستخدم"
                className={`border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-primary bg-white"} rounded-lg p-3 w-[63%] sm:w-[64%] md:w-[74%] lg:w-[75%] text-right focus:outline-none focus:border-primary focus:border-2`}
              />
              <ErrorMessage
                name="username"
                component="p"
                className="text-red-500 text-lg text-center"
              />
            </div>
            <div>
              <Field
                name="password"
                type="password"
                placeholder="كلمة المرور"
                className={`border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-primary bg-white"} rounded-lg p-3 w-[63%] sm:w-[64%] md:w-[74%] lg:w-[75%] text-right focus:outline-none focus:border-primary focus:border-2`}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-lg text-center"
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-[#f8f8ff] p-3 rounded-lg w-[63%] sm:w-[64%] md:w-[74%] lg:w-[75%] mx-auto cursor-pointer hover:bg-primary/90 transition-colors"
            >
              تسجيل الدخول
            </button>
            {apiError ? <p className="text-red-500 text-center">{apiError}</p> : null}
          </Form>
        </Formik>
        <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} isDark={isDark} />
      </div>
    </div>
  );
}
