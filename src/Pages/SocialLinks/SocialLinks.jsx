import Table from "../../Components/Customs/Table";
import CardList from "../../Components/Customs/CardList";
import { useEffect, useState } from "react";
import {
  getApiErrorMessage,
  socialLinksService,
} from "../../services/apiServices";
import { FiPlus, FiX, FiAlertCircle, FiTrash2 } from "react-icons/fi";

const contactHeaders = [
  { label: "الإجراءات", key: "actions" },
  {
    label: "الرابط",
    key: "url",
    render: (value, row) => (
      <a
        href={value?.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline font-semibold"
      >
        الرابط
      </a>
    ),
  },
  { label: "الأيقونة", key: "icon" },
  { label: "ترتيب العرض", key: "sortOrder" },
  { 
    label: "الحالة", 
    key: "isActive",
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {value ? "نشط" : "غير نشط"}
      </span>
    )
  },
  { label: "اسم المنصة", key: "platformName" },
];

const cardOrder = ["platformName", "icon", "url", "sortOrder", "isActive"];

export default function SocialLinks() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formData, setFormData] = useState({
    platformName: "",
    url: "",
    icon: "",
    sortOrder: 1,
    isActive: true,
  });

  const loadLinks = async () => {
    try {
      const data = await socialLinksService.list();
      setRows(data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    document.title = "لوحة التحكم | روابط التواصل ";
    loadLinks();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      platformName: "",
      url: "",
      icon: "",
      sortOrder: rows.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row) => {
    setEditingItem(row);
    setFormData({
      platformName: row.platformName || "",
      url: row.url || "",
      icon: row.icon || "",
      sortOrder: row.sortOrder || 1,
      isActive: row.isActive !== undefined ? row.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      platformName: "",
      url: "",
      icon: "",
      sortOrder: 1,
      isActive: true,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.platformName.trim()) {
        setError("يرجى إدخال اسم المنصة");
        return;
      }
      if (!formData.url.trim()) {
        setError("يرجى إدخال الرابط");
        return;
      }

      const payload = {
        platformName: formData.platformName.trim(),
        url: formData.url.trim(),
        icon: formData.icon.trim() || formData.platformName.toLowerCase().trim(),
        sortOrder: parseInt(formData.sortOrder) || 1,
        isActive: formData.isActive,
      };

      if (editingItem && editingItem.id) {
        await socialLinksService.update(editingItem.id, payload);
      } else {
        await socialLinksService.create(payload);
      }
      
      await loadLinks();
      handleCloseModal();
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleOpenDeleteModal = (row) => {
    setDeletingItem(row);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await socialLinksService.remove(deletingItem.id);
      await loadLinks();
      handleCloseDeleteModal();
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleToggleActive = async (row) => {
    try {
      await socialLinksService.update(row.id, {
        ...row,
        isActive: !row.isActive,
      });
      await loadLinks();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="bg-[rgba(255,248,235,1)] min-h-screen">
      <div className="container mx-auto px-6 overflow-hidden">
        {/* Header */}
        <div className="mt-10 mb-6" dir="rtl">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <FiPlus className="w-5 h-5" />
            إضافة رابط جديد
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Table for Desktop */}
        <div className="overflow-x-auto hidden md:block rounded-3xl">
          <Table 
            headers={contactHeaders} 
            data={rows} 
            onDeleteRow={handleOpenDeleteModal}
            onEditRow={handleOpenEditModal}
            onSaveRow={handleSave}
          />
        </div>

        {/* Card List for Mobile */}
        <CardList
          headers={contactHeaders}
          data={rows}
          order={cardOrder}
          onDeleteRow={handleOpenDeleteModal}
          onEditRow={handleOpenEditModal}
          onSaveRow={handleSave}
        />

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden animate-slideUp"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  {editingItem ? "تعديل رابط" : "إضافة رابط جديد"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنصة *
                  </label>
                  <input
                    type="text"
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                    placeholder="مثال: Instagram, Facebook, Twitter"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الرابط *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.instagram.com/..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأيقونة
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="مثال: instagram, facebook, twitter"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    سيتم استخدام اسم المنصة كقيمة افتراضية إذا تركت هذا الحقل فارغاً
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    نشط
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleCloseDeleteModal}
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
                  onClick={handleCloseDeleteModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 text-center mb-6 text-lg">
                  هل أنت متأكد من حذف رابط "{deletingItem?.platformName}"؟
                </p>
                <p className="text-gray-500 text-sm text-center mb-2">
                  لا يمكن التراجع عن هذا الإجراء
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                    حذف
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
