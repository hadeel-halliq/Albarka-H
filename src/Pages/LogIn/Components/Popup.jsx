import { motion as Motion, AnimatePresence } from "framer-motion";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi";
import { FiX } from "react-icons/fi";

export default function Popup({ isOpen, onClose, message, isSuccess = false, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <Motion.div
            className="fixed top-1/2 left-1/2 z-50 w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex flex-col items-center text-center relative">
              {/* زر الإغلاق */}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                aria-label="إغلاق"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* الأيقونة حسب الحالة */}
              <Motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`mb-4 p-3 rounded-full ${
                  isSuccess ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {isSuccess ? (
                  <HiCheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <HiExclamationCircle className="h-10 w-10 text-primary" />
                )}
              </Motion.div>

              {/* العنوان والرسالة */}
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {title || (isSuccess ? "نجاح!" : "تنبيه")}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {message || (isSuccess ? "تمت العملية بنجاح" : "حدث خطأ، يرجى المحاولة مرة أخرى")}
                </p>
              </Motion.div>

              {/* زر الإغلاق */}
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`px-8 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  isSuccess
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
                onClick={onClose}
              >
                حسنًا
              </Motion.button>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}