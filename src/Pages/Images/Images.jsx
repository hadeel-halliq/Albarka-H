import { useEffect, useState } from "react";
import { getApiErrorMessage, mediaService } from "../../services/apiServices";
import { Upload, AlertCircle, X, Eye, Trash2 } from "lucide-react";

export default function ImageManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editImage, setEditImage] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  
  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);


  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await mediaService.list();
      setImages(
        data.map((item) => ({
          id: item.id,
          name: item.altText || `صورة ${item.id}`,
          url: item.fileUrl || item.url || item.secureUrl,
        }))
      );
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await mediaService.remove(id);
      await loadMedia();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleEdit = (img) => {
    setEditImage(img);
    setEditName(img.name);
  };

  const handleSaveEdit = async () => {
    try {
      await mediaService.update(editImage.id, { altText: editName });
      setEditImage(null);
      await loadMedia();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  // Upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError("");
    
    try {
      await mediaService.upload(selectedFile, altText);
      resetUploadForm();
      await loadMedia();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
    setUploading(false);
  };

  // Delete handlers
  const handleDeleteClick = (img) => {
    setSelectedImage(img);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedImage) return;
    
    try {
      await mediaService.remove(selectedImage.id);
      setShowDeleteModal(false);
      setSelectedImage(null);
      await loadMedia();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  // Utility functions
  const formatFileType = (type) => {
    if (!type) return "غير معروف";
    return type.replace("image/", "").toUpperCase();
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
    document.title = "لوحة التحكم | إدارة الصور"
    loadMedia();
  }, [])

  return (
    <div className="min-h-screen bg-[rgba(255,248,235,1)] overflow-x-hidden" dir="rtl">
    
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span>رفع صورة جديدة</span>
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
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صور</h3>
            <p className="text-gray-500 mb-6">ابدأ برفع الصور لإدارتها</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              رفع أول صورة
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                        title="معاينة"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </a>
                      <button
                        onClick={() => handleDeleteClick(img)}
                        className="p-2 bg-red-500/90 hover:bg-red-500 rounded-full transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-900 font-medium truncate mb-1">
                      {img.name || "بدون وصف"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileType(img.type)}</span>
                      <span>{formatDate(img.createdAt)}</span>
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
                  صفحة {currentPage} من {totalPages} ({totalItems} صورة)
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-primary/10 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">رفع صورة جديدة</h2>
                <button
                  onClick={resetUploadForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="معاينة"
                      className="max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">
                      اضغط لاختيار ملف أو اسحب وأفلت
                    </p>
                    <p className="text-sm text-gray-500">
                      JPEG, PNG, WebP (الحد الأقصى 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-3 inline-block bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      اختيار ملف
                    </label>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النص البديل (اختياري)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="وصف الصورة لتحسين إمكانية الوصول"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={512}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={resetUploadForm}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {uploading ? "جاري الرفع..." : "رفع الصورة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700">حذف الصورة</h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                هل أنت متأكد من رغبتك في حذف هذه الصورة؟
              </p>
              
              {selectedImage.url && (
                <div className="mb-4">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-600">
                  <strong>الوصف:</strong> {selectedImage.name || "بدون وصف"}
                </p>
                <p className="text-gray-600 mt-1">
                  <strong>النوع:</strong> {formatFileType(selectedImage.type)}
                </p>
              </div>

              <p className="mt-4 text-sm text-red-600 font-medium">
                سيتم حذف الصورة نهائياً من Cloudinary ولا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedImage(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف الصورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
