import { motion as Motion, AnimatePresence } from "framer-motion";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi";

export default function Popup({
  isOpen,
  onClose,
  message,
  isSuccess,
}) {
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
          />

          <Motion.div
            dir="rtl"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{
                scale: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 18,
                  stiffness: 250,
                },
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: -20,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 text-right"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-5 p-4 rounded-full ${
                    isSuccess ? "bg-green-100" : "bg-orange-100"
                  }`}
                >
                  {isSuccess ? (
                    <HiCheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <HiExclamationCircle className="w-12 h-12 text-orange-500" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {isSuccess ? "تم بنجاح" : "تنبيه"}
                </h2>

                <p className="text-gray-600 mb-6 leading-7">
                  {message}
                </p>

                <button
                  onClick={onClose}
                  className="bg-primary text-white px-8 py-3 rounded-xl hover:opacity-90 transition-all cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}