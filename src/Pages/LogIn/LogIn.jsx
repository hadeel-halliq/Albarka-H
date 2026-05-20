import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import icon1 from "../../images/icon1.png";
import Popup from "./Components/Popup";
import { authService, getApiErrorMessage } from "../../services/apiServices";
import { FiEye, FiEyeOff } from "react-icons/fi"; 
export default function LogIn() {
  useEffect(() => {
    document.title = "لوحة التحكم | تسجيل الدخول";
  }, []);

  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  

  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    username: Yup.string().email("صيغة البريد غير صحيحة").required("البريد الإلكتروني مطلوب"),
    password: Yup.string().required("كلمة المرور مطلوبة"),
  });

  const handleLogIn = async (values, { setSubmitting }) => {
    setPopupMessage("");
    setIsSuccess(false);
    
    try {
      await authService.login(values.username.trim(), values.password);
      await authService.me();
      navigate("/home");
    } catch (error) {
      const errorMsg = getApiErrorMessage(error);
      setPopupMessage(errorMsg);
      setIsSuccess(false);
      setIsPopupOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(to_bottom_left,rgba(255,255,255,1),rgba(250,177,71,1))] flex flex-col items-center justify-center min-h-screen px-4 py-10">
      <div className="bg-[rgb(255,248,235)] border-primary border-[1px] py-8 sm:py-10 px-6 sm:px-8 rounded-3xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center shadow-lg relative overflow-hidden">
        

        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <img src={icon1} className="w-40 sm:w-48 md:w-56 lg:w-64 mx-auto mb-4" alt="icon" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgba(73,65,58,1)]">
            أهلاً بك في لوحة التحكم
          </h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">سجّل دخولك للمتابعة</p>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogIn}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="flex flex-col gap-4">
                <div className="text-right">
                  <Field
                    name="username"
                    type="text"
                    placeholder="البريد الإلكتروني"
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <ErrorMessage name="username" component="p" className="text-red-500 text-xs mt-1.5 text-right" />
                </div>

                <div className="text-right relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="كلمة المرور"
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    tabIndex={-1} 
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                  
                  <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1.5 text-right" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      . . . جاري تسجيل الدخول 
                    </span>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-xs text-gray-400 mt-6">© 2024 لوحة التحكم. جميع الحقوق محفوظة.</p>
        </div>
      </div>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        message={popupMessage}
        isSuccess={isSuccess}
        title={isSuccess ? "تم تسجيل الدخول!" : "فشل تسجيل الدخول"}
      />
    </div>
  );
}