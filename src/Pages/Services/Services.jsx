import { useEffect, useState } from "react";
import { getApiErrorMessage, servicesService, mediaService } from "../../services/apiServices";
import { Upload, AlertCircle, X, Eye, Trash2, Edit2, Plus, Check, XCircle } from "lucide-react";

export default function Services() {
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.title = "لوحة التحكم | إدارة الخدمات"
    
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      } else {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };
    
    window.addEventListener("storage", handleThemeChange);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkMode = document.documentElement.classList.contains("dark");
          setIsDark(isDarkMode);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      window.removeEventListener("storage", handleThemeChange);
      observer.disconnect();
    };
  }, []);
  
  // Modal states for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageId: "",
    sortOrder: 1,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await servicesService.list({ page: currentPage, limit: 20, isActive: undefined });
      setServices(data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const data = await mediaService.list();
      setImages(data.map(item => ({
        id: item.id,
        name: item.altText || `صورة ${item.id}`,
        url: item.fileUrl || item.url || item.secureUrl,
      })));
    } catch (err) {
      console.error("Failed to load images:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await servicesService.remove(id);
      await loadServices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      imageId: service.image?.id?.toString() || "",
      sortOrder: service.sortOrder || 1,
      isActive: service.isActive ?? true
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      imageId: "",
      sortOrder: services.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("يرجى إدخال اسم الخدمة");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        imageId: formData.imageId ? parseInt(formData.imageId) : null,
        sortOrder: parseInt(formData.sortOrder) || 1,
        isActive: formData.isActive
      };

      if (editingService) {
        await servicesService.update(editingService.id, payload);
      } else {
        await servicesService.create(payload);
      }
      
      resetForm();
      await loadServices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      imageId: "",
      sortOrder: 1,
      isActive: true
    });
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedService) return;
    
    try {
      await servicesService.remove(selectedService.id);
      setShowDeleteModal(false);
      setSelectedService(null);
      await loadServices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const toggleIsActive = async (service) => {
    try {
      await servicesService.update(service.id, { isActive: !service.isActive });
      await loadServices();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  useEffect(() => {
    document.title = "لوحة التحكم | إدارة الخدمات";
    loadServices();
    loadImages();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[rgba(26,26,46,1)]" : "bg-[rgba(255,248,235,1)]"} transition-colors duration-300`} dir="rtl">
      {/* Header */}
      <div className={`px-6 py-4 ${isDark ? "" : ""}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={handleAddNew}
            className={`flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg ${isDark ? "" : ""}`}
          >
            <Plus className="w-5 h-5" />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError("")} className="mr-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة الخدمات</p>
            <button
              onClick={handleAddNew}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة أول خدمة
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {service.image?.fileUrl ? (
                      <img
                        src={service.image.fileUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Upload className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {service.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 bg-blue-500/90 hover:bg-blue-500 rounded-full transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => toggleIsActive(service)}
                        className="p-2 bg-purple-500/90 hover:bg-purple-500 rounded-full transition-colors"
                        title={service.isActive ? "إلغاء التفعيل" : "تفعيل"}
                      >
                        {service.isActive ? <XCircle className="w-5 h-5 text-white" /> : <Check className="w-5 h-5 text-white" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service)}
                        className="p-2 bg-red-500/90 hover:bg-red-500 rounded-full transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.description || "لا يوجد وصف"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>الترتيب: {service.sortOrder}</span>
                      <span>{formatDate(service.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>
                
                <span className="px-4 py-2 text-gray-700">
                  صفحة {currentPage} من {totalPages} ({totalItems} خدمة)
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-primary/10 px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">
                  {editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الخدمة *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: قص الفولاذ المخصص"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الخدمة..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصورة
                </label>
                <select
                  value={formData.imageId}
                  onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">اختر صورة...</option>
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.name}
                    </option>
                  ))}
                </select>
                {formData.imageId && (
                  <div className="mt-2 relative">
                    <div className="relative w-full h-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <img
                        src={images.find(i => i.id.toString() === formData.imageId)?.url}
                        alt="معاينة"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => window.location.href = "/images"}
                  className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  رفع صور جديدة
                </button>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  نشط (ظاهر للعملاء)
                </label>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={submitting || !formData.name.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {submitting ? "جاري الحفظ..." : (editingService ? "حفظ التعديلات" : "إضافة الخدمة")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700">حذف الخدمة</h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                هل أنت متأكد من رغبتك في حذف هذه الخدمة؟
              </p>
              
              {selectedService.image?.fileUrl && (
                <div className="mb-4">
                  <img
                    src={selectedService.image.fileUrl}
                    alt={selectedService.name}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-600">
                  <strong>الاسم:</strong> {selectedService.name}
                </p>
                <p className="text-gray-600 mt-1">
                  <strong>الوصف:</strong> {selectedService.description || "-"}
                </p>
              </div>

              <p className="mt-4 text-sm text-red-600 font-medium">
                سيتم حذف الخدمة نهائياً ولا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
