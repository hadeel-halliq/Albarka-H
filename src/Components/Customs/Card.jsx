import { useState } from "react";
import CardRow from "./CardRow";
import { FiTrash2, FiX, FiAlertCircle, FiEdit, FiMapPin } from "react-icons/fi";

export default function Card({ data, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await onDelete();
  };

  // استخراج العنوان للعرض في الهيدر
  const addressItem = data.find(item => item.header === "address");
  const phoneItem = data.find(item => item.header === "phone");

  return (
    <>
      <div 
        className="bg-gradient-to-l from-white to-primary/5 rounded-3xl shadow-lg p-5 border-2 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
        dir="rtl"
      >
        {/* زخرفة خلفية */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 group-hover:bg-primary/10 transition-colors"></div>
        
        {/* Header الكارد */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{addressItem?.value || "فرع"}</h3>
              {phoneItem?.value && phoneItem.value !== "-" && (
                <p className="text-xs text-gray-500 ltr text-right" dir="ltr">{phoneItem.value}</p>
              )}
            </div>
          </div>
          
          {/* زر التعديل السريع */}
          <button
            onClick={() => onEdit(data[0]?.header)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
            title="تعديل"
          >
            <FiEdit className="w-5 h-5" />
          </button>
        </div>
        
        {/* محتوى الكارد */}
        <div className="space-y-2.5 relative z-10">
          {data.map((item, i) => {
            // لا نعرض العنوان والهاتف في القائمة لأنهم في الهيدر
            if (item.header === "address" || item.header === "phone") return null;
            
            return (
              <div 
                key={i} 
                className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <CardRow title={item.title} value={item.value} headerKey={item.header} />
              </div>
            );
          })}
        </div>

        {/* زر الحذف في الأسفل */}
        <div className="flex justify-end items-center mt-4 pt-3 border-t border-primary/20" dir="rtl">
          <button 
            className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium" 
            onClick={handleDeleteClick}
            title="حذف"
          >
            <FiTrash2 className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal - بنفس تصميم الصفحة */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-slideUp"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header مع أيقونة تحذير */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* محتوى الرسالة */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-4">هل أنت متأكد من حذف هذا الفرع؟</p>
              
              {addressItem?.value && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700">{addressItem.value}</p>
                  {phoneItem?.value && phoneItem.value !== "-" && (
                    <p className="text-xs text-gray-500 mt-1 ltr" dir="ltr">{phoneItem.value}</p>
                  )}
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  حذف
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}