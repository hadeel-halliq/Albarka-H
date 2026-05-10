import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { authService, getApiErrorMessage } from "../../services/apiServices";
import Popup from "./Components/Popup";

export default function AdminProfile() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminData, setAdminData] = useState(null);


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
      setIsPopupOpen(true);
      resetForm({ values: { name: updated.admin?.name, email: updated.admin?.email } });
    } catch (error) {
      setPopupMessage(getApiErrorMessage(error));
      setIsSuccess(false);
      setIsPopupOpen(true);
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
      setIsPopupOpen(true);
      resetForm();
    } catch (error) {
      setPopupMessage(getApiErrorMessage(error));
      setIsSuccess(false);
      setIsPopupOpen(true);
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
    <div className="bg-[rgba(255,248,235,1)] min-h-screen py-8">
      <div className="container mx-auto px-6">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">إعدادات الحساب</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            تسجيل الخروج
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>البيانات الشخصية</span>
            </h2>

            <Formik
              initialValues={{
                name: adminData?.name || "",
                email: adminData?.email || "",
              }}
              enableReinitialize={true}
              validationSchema={Yup.object({
                name: Yup.string().required("الاسم مطلوب"),
                email: Yup.string().email("صيغة البريد غير صحيحة").required("البريد الإلكتروني مطلوب"),
              })}
              onSubmit={handleUpdateProfile}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">الاسم</label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="أدخل اسمك"
                      className="border border-primary rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-primary text-right"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">البريد الإلكتروني</label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      className="border border-primary rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-primary text-right"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-6 py-3 rounded-lg w-full hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>


          <div className="bg-white rounded-xl shadow-lg p-6 border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>تغيير كلمة المرور</span>
            </h2>

            <Formik
              initialValues={{
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
              }}
              validate={validatePasswords}
              validationSchema={Yup.object({
                oldPassword: Yup.string().required("كلمة المرور الحالية مطلوبة"),
                newPassword: Yup.string()
                  .required("كلمة المرور الجديدة مطلوبة")
                  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
                confirmPassword: Yup.string()
                  .required("يرجى تأكيد كلمة المرور")
                  .oneOf([Yup.ref("newPassword"), null], "كلمتا المرور غير متطابقتين"),
              })}
              onSubmit={handleChangePassword}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">كلمة المرور الحالية</label>
                    <Field
                      name="oldPassword"
                      type="password"
                      placeholder="أدخل كلمة المرور الحالية"
                      className="border border-primary rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-primary text-right"
                    />
                    <ErrorMessage
                      name="oldPassword"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">كلمة المرور الجديدة</label>
                    <Field
                      name="newPassword"
                      type="password"
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="border border-primary rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-primary text-right"
                    />
                    <ErrorMessage
                      name="newPassword"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">تأكيد كلمة المرور</label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      placeholder="أكد كلمة المرور الجديدة"
                      className="border border-primary rounded-lg p-3 w-full focus:outline-none focus:border-2 focus:border-primary text-right"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-6 py-3 rounded-lg w-full hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "جاري التغيير..." : "تغيير كلمة المرور"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {adminData && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-4">معلومات الحساب</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-gray-600 text-sm">الاسم</p>
                <p className="text-primary font-bold text-lg">{adminData.name}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-gray-600 text-sm">البريد الإلكتروني</p>
                <p className="text-primary font-bold text-lg">{adminData.email}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-gray-600 text-sm">المعرف</p>
                <p className="text-primary font-bold text-lg">#{adminData.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        message={popupMessage}
        isSuccess={isSuccess}
      />
    </div>
  );
}
