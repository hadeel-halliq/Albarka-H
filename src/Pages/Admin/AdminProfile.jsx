import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { authService, getApiErrorMessage } from "../../services/apiServices";
import Popup from "./Components/Popup";
import { FiX } from "react-icons/fi";

export default function AdminProfile() {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isPasswordPopupOpen, setIsPasswordPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setAdminData(data?.admin || data);
      } catch (error) {
        console.error("فشل جلب البروفايل:", error);
      }
    };
    fetchProfile();
    
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
  }, []);

  const validatePasswords = (values) => {
    const errors = {};
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    if (values.newPassword && values.newPassword.length < 8) {
      errors.newPassword = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }
    return errors;
  };

  const handleUpdateProfile = async (values, { setSubmitting, resetForm }) => {
    try {
      const updated = await authService.updateProfile({
        name: values.name,
        email: values.email,
      });
      setAdminData(updated?.admin || updated);
      setPopupMessage("تم تحديث البيانات بنجاح!");
      setIsSuccess(true);
      setIsProfilePopupOpen(true);
      resetForm({ values: { name: updated.admin?.name, email: updated.admin?.email } });
    } catch (error) {
      setPopupMessage(getApiErrorMessage(error));
      setIsSuccess(false);
      setIsProfilePopupOpen(true); // ✅ تم تصحيح الخطأ المطبعي
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await authService.changePassword(
        values.oldPassword,
        values.newPassword,
        values.confirmPassword
      );
      setPopupMessage("تم تغيير كلمة المرور بنجاح!");
      setIsSuccess(true);
      setIsPasswordPopupOpen(false);
      resetForm();
    } catch (error) {
      setPopupMessage(getApiErrorMessage(error));
      setIsSuccess(false);
      setIsPasswordPopupOpen(true); // ✅ فتح المودال عند الخطأ
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("فشل تسجيل الخروج:", error);
    }
  };

  return (
    <div className={`${isDark ? "bg-[rgba(26,26,46,1)]" : "bg-[rgba(255,248,235,1)]"} min-h-screen py-8 transition-colors duration-300`}>
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mb-8" dir="rtl">
          <button
            onClick={handleLogout}
            className={`w-full sm:w-auto ${isDark ? "bg-red-500/10 text-red-400 border-red-800 hover:bg-red-500 hover:text-white" : "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500 hover:text-white"} border px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer`}
          >
            تسجيل الخروج
          </button>
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-primary" : "text-primary"}`}>إعدادات الحساب</h1>
        </div>

        <div className="flex justify-center" dir="rtl">
          {/* ✅ كارد الفورم الرئيسي */}
          <div className={`${isDark ? "bg-gradient-to-l from-gray-800 to-gray-700 border-gray-600" : "bg-gradient-to-l from-white to-primary/5 border-primary/20"} rounded-3xl shadow-lg p-6 md:p-8 border-2 relative overflow-hidden w-full max-w-xl`}>
            <div className={`absolute top-0 left-0 w-24 h-24 ${isDark ? "bg-primary/10" : "bg-primary/5"} rounded-full -translate-x-1/2 -translate-y-1/2`}></div>
            <div className={`absolute bottom-0 right-0 w-20 h-20 ${isDark ? "bg-primary/10" : "bg-primary/5"} rounded-full translate-x-1/2 translate-y-1/2`}></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-primary mb-6">البيانات الشخصية</h2>

              <Formik
                initialValues={{ name: adminData?.name || "", email: adminData?.email || "" }}
                enableReinitialize={true}
                validationSchema={Yup.object({
                  name: Yup.string().required("الاسم مطلوب"),
                  email: Yup.string().email("صيغة البريد غير صحيحة").required("البريد الإلكتروني مطلوب"),
                })}
                onSubmit={handleUpdateProfile}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                      <Field name="name" type="text" placeholder="أدخل اسمك" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right bg-white" />
                      <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1.5" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <Field name="email" type="email" placeholder="أدخل بريدك الإلكتروني" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right bg-white" />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1.5" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>

                    <button type="button" onClick={() => setIsPasswordPopupOpen(true)} className="w-full text-center text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer mt-2">
                      تغيير كلمة المرور
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>

        {/* ✅ كارد معلومات الحساب */}
        {adminData && (
          <div className="mt-8 bg-gradient-to-l from-white to-primary/5 rounded-3xl shadow-lg p-6 md:p-8 border-2 border-primary/20 relative overflow-hidden" dir="rtl">
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-primary mb-6">معلومات الحساب</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm mb-1">الاسم</p>
                  <p className="text-lg font-bold text-gray-800 truncate">{adminData.name}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm mb-1">البريد الإلكتروني</p>
                  <p className="text-lg font-bold text-gray-800 truncate">{adminData.email}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm mb-1">المعرف</p>
                  <p className="text-lg font-bold text-gray-800">#{adminData.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Popup تغيير كلمة المرور (ثابت، أبيض صلب، غير شفاف) */}
      {isPasswordPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setIsPasswordPopupOpen(false)}
        >
          <div
            className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-slideUp`}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زخرفة خلفية خفيفة وثابتة */}
            <div className={`absolute top-0 left-0 w-32 h-32 ${isDark ? "bg-primary/10" : "bg-primary/10"} rounded-full -translate-x-1/2 -translate-y-1/2`}></div>
            <div className={`absolute bottom-0 right-0 w-24 h-24 ${isDark ? "bg-primary/10" : "bg-primary/10"} rounded-full translate-x-1/2 translate-y-1/2`}></div>

            <div className="relative z-10 p-6">
              <div className={`flex justify-between items-center mb-6 ${isDark ? "border-gray-700" : "border-gray-200"} pb-4`}>
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  🔑 تغيير كلمة المرور
                </h2>
                <button
                  onClick={() => setIsPasswordPopupOpen(false)}
                  className={`text-gray-400 hover:text-red-500 ${isDark ? "hover:bg-red-900/30" : "hover:bg-red-50"} rounded-full p-2 transition-all`}
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <Formik
                initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
                validate={validatePasswords}
                validationSchema={Yup.object({
                  oldPassword: Yup.string().required("كلمة المرور الحالية مطلوبة"),
                  newPassword: Yup.string().required("كلمة المرور الجديدة مطلوبة").min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
                  confirmPassword: Yup.string().required("يرجى تأكيد كلمة المرور").oneOf([Yup.ref("newPassword"), null], "كلمتا المرور غير متطابقتين"),
                })}
                onSubmit={handleChangePassword}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-5">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>كلمة المرور الحالية</label>
                      <Field name="oldPassword" type="password" className={`w-full border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right`} />
                      <ErrorMessage name="oldPassword" component="p" className="text-red-500 text-xs mt-1.5" />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>كلمة المرور الجديدة</label>
                      <Field name="newPassword" type="password" className={`w-full border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right`} />
                      <ErrorMessage name="newPassword" component="p" className="text-red-500 text-xs mt-1.5" />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>تأكيد كلمة المرور</label>
                      <Field name="confirmPassword" type="password" className={`w-full border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"} rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right`} />
                      <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1.5" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                      {isSubmitting ? "جاري التغيير..." : "تغيير كلمة المرور"}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* Popup الإشعار العام */}
      <Popup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        message={popupMessage}
        isSuccess={isSuccess}
      />
    </div>
  );
}