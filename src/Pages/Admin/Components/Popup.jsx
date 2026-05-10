import { motion as Motion } from "framer-motion";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi";

export default function Popup({ isOpen, onClose, message, isSuccess }) {
  return (
    <>
      {isOpen && (
        <>
          <Motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <Motion.div
            className="fixed top-1/2 left-1/2 z-50 w-11/12 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-2xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 300,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -10,
              transition: { duration: 0.2 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center relative">
              <Motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`mb-4 p-3 rounded-full ${
                  isSuccess ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {isSuccess ? (
                  <HiCheckCircle className="h-10 w-10 text-green-500" />
                ) : (
                  <HiExclamationCircle className="h-10 w-10 text-primary" />
                )}
              </Motion.div>

              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isSuccess ? "تم بنجاح!" : "تنبيه"}
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
              </Motion.div>

              <Motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: isSuccess
                    ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                    : "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-primary text-white rounded-lg shadow-md transition-all cursor-pointer"
                onClick={onClose}
              >
                إغلاق
              </Motion.button>
            </div>
          </Motion.div>
        </>
      )}
    </>
  );
}
