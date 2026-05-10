import { useState } from "react";
import CardRow from "./CardRow";
import pen from "../../images/pen.png";
import deletIcon from "../../images/deletIcon.png";
import { FiTrash2, FiX, FiAlertCircle } from "react-icons/fi";

export default function Card({ data, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    await onDelete();
  };

  return (
    <>
      <div className="rounded-lg p-4 shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow" dir="rtl">
        <div className="grid gap-3">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2.5 rounded-lg border-b border-gray-100 last:border-b-0">
              <CardRow title={item.title} value={item.value} headerKey={item.header} />
              {item.header !== "link" && item.header !== "linkText" && (
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => onEdit(item.header)}
                  title="تعديل"
                >
                  <img src={pen} alt="edit" className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200" dir="rtl">
          <span className="font-semibold text-gray-700">الإجراءات</span>
          <div className="flex gap-3 flex-row-reverse">
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors" 
              onClick={handleDeleteClick}
              title="حذف"
            >
              <img src={deletIcon} alt="delete" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden animate-slideUp"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <FiAlertCircle className="w-6 h-6" />
                تأكيد الحذف
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                aria-label="إغلاق"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 text-lg">
                هل أنت متأكد من حذف هذا العنصر؟
              </p>
              <p className="text-gray-500 text-sm text-center mb-2">
                لا يمكن التراجع عن هذا الإجراء
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
