import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { getApiErrorMessage, productsService, variantsService } from "../../services/apiServices";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    thickness: "",
    thicknessUnit: "MM",
    weight: "",
    weightUnit: "KG",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  
  // حالة لإدارة نافذة تعديل المنتج
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    length: "",
    lengthUnit: "MM",
    isActive: true,
  });

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productData, variantsData] = await Promise.all([
        productsService.getById(id),
        variantsService.listByProduct(id)
      ]);
      console.log("PRODUCT DATA =>", productData);
      setProduct(productData.product);
      // تأكد من أن variants مصفوفة دائماً
      const variantsArray = Array.isArray(variantsData) ? variantsData : [];
      console.log('Loaded variants:', variantsArray); // للتصحيح
      setVariants(variantsArray);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error('Error loading product data:', err);
      // في حالة الخطأ، نضمن أن variants مصفوفة فارغة
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "لوحة التحكم | تفاصيل المنتج";
    loadProductData();
  }, [id]);

  // دوال إدارة نافذة تعديل المنتج
  const openProductEditModal = () => {
    if (product) {
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        length: product.length || "",
        lengthUnit: product.lengthUnit || "MM",
        isActive: product.isActive ?? true,
      });
      setShowProductModal(true);
    }
  };

  const closeProductEditModal = () => {
    setShowProductModal(false);
    setProductForm({
      name: "",
      description: "",
      length: "",
      lengthUnit: "MM",
      isActive: true,
    });
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        length: parseFloat(productForm.length),
        lengthUnit: productForm.lengthUnit,
        isActive: productForm.isActive,
      };

      await productsService.update(id, payload);
      setError("تم تحديث معلومات المنتج بنجاح!");
      setTimeout(() => setError(""), 3000);
      await loadProductData();
      closeProductEditModal();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      console.error('Error updating product:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    console.log('openAddModal called'); // للتصحيح
    setEditingVariant(null);
    setFormData({
      thickness: "",
      thicknessUnit: "MM",
      weight: "",
      weightUnit: "KG",
    });
    setShowModal(true);
    console.log('showModal should be true now'); // للتصحيح
  };

  const openEditModal = (variant) => {
    setEditingVariant(variant);
    setFormData({
      thickness: variant.thickness || "",
      thicknessUnit: variant.thicknessUnit || "MM",
      weight: variant.weight || "",
      weightUnit: variant.weightUnit || "KG",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVariant(null);
    setFormData({
      thickness: "",
      thicknessUnit: "MM",
      weight: "",
      weightUnit: "KG",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // تحقق من صحة البيانات قبل الإرسال
      const thicknessValue = parseFloat(formData.thickness);
      const weightValue = parseFloat(formData.weight);
      
      if (isNaN(thicknessValue) || thicknessValue <= 0) {
        throw new Error("السماكة يجب أن تكون رقماً موجباً");
      }
      if (isNaN(weightValue) || weightValue <= 0) {
        throw new Error("الوزن يجب أن يكون رقماً موجباً");
      }

      const payload = {
        productId: parseInt(id),
        thickness: thicknessValue,
        thicknessUnit: formData.thicknessUnit,
        weight: weightValue,
        weightUnit: formData.weightUnit,
      };

      console.log('Submitting variant payload:', payload); // للتصحيح

      if (editingVariant) {
        // تعديل variant موجود - لا نرسل productId في التعديل
        const { productId, ...updatePayload } = payload;
        console.log('Updating variant:', editingVariant.id, updatePayload);
        await variantsService.update(editingVariant.id, updatePayload);
        setError("تم تعديل النوع بنجاح!");
      } else {
        // إضافة variant جديد
        console.log('Creating variant:', payload);
        await variantsService.create(payload);
        setError("تم إضافة النوع بنجاح!");
      }
      setTimeout(() => setError(""), 3000);
      await loadProductData();
      handleCloseModal();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      console.error('Error submitting form:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لفتح نافذة الإضافة مع التأكد من إغلاق أي رسائل سابقة
  const handleOpenAddModal = () => {
    console.log('Opening add modal'); // للتصحيح
    setError("");
    openAddModal();
  };

  const handleDelete = (variant) => {
    setVariantToDelete(variant);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!variantToDelete) return;
    try {
      await variantsService.remove(variantToDelete.id);
      setError("تم حذف النوع بنجاح!");
      setTimeout(() => setError(""), 3000);
      await loadProductData();
      setShowDeleteModal(false);
      setVariantToDelete(null);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      setShowDeleteModal(false);
      setVariantToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVariantToDelete(null);
  };

  if (loading && !product) {
    return (
      <div className="bg-[rgba(255,248,235,1)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,248,235,1)] min-h-screen" dir="rtl">
      <div className="container mx-auto px-6 overflow-hidden">
        {/* Header مع زر الرجوع */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 my-6" dir="rtl">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">تفاصيل المنتج</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 bg-white border border-primary text-primary font-semibold py-2 px-3 sm:px-4 rounded-lg hover:bg-primary/10 transition-all text-sm sm:text-base"
            >
              <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">الصفحة السابقة</span>
              <span className="sm:hidden">رجوع</span>
            </button>
            <button
              onClick={() => openProductEditModal()}
              className="flex items-center gap-2 bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-2 px-3 sm:px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">تفاصيل المنتج</span>
              <span className="sm:hidden">تعديل</span>
            </button>
          </div>
        </div>

        {/* معلومات المنتج الأساسية */}
        {product && (
          <div className="bg-gradient-to-l from-white to-primary/5 rounded-3xl shadow-lg p-8 mb-8 border-2 border-primary/30 relative overflow-hidden">
            {/* زخرفة خلفية */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">معلومات المنتج</h2>
                <p className="text-gray-500 text-sm">عرض وتعديل بيانات المنتج الأساسية</p>
              </div>
              <button
                onClick={openProductEditModal}
                className="flex items-center gap-2 bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <FiEdit className="w-5 h-5" />
                تعديل المنتج
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-gray-500">اسم المنتج</label>
                </div>
                <p className="text-lg font-bold text-gray-800 pr-13">{product.name || "-"}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-gray-500">الطول</label>
                </div>
                <p className="text-lg font-bold text-gray-800 pr-13">
                  {product.length} <span className="text-sm font-normal text-gray-500">{product.lengthUnit || "MM"}</span>
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: product.isActive ? '#dcfce7' : '#fee2e2' }}>
                    {product.isActive ? (
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <label className="text-sm font-medium text-gray-500">الحالة</label>
                </div>
                <p className={`text-lg font-bold pr-13 ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isActive ? "نشط" : "غير نشط"}
                </p>
              </div>
              
              {product.description && (
                <div className="md:col-span-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-gray-500">الوصف</label>
                  </div>
                  <p className="text-gray-700 leading-relaxed pr-13">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* عرض الرسائل */}
        {error && (
          <div className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
            error.includes('تم') ? 'bg-green-100 border-r-4 border-green-500 text-green-700' : 'bg-red-100 border-r-4 border-red-500 text-red-700'
          }`} dir="rtl">
            {error.includes('تم') ? (
              <FiCheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold">{error.includes('تم') ? 'نجاح!' : 'خطأ!'}</p>
              <p>{error}</p>
            </div>
            <button 
              onClick={() => setError("")}
              className="mr-auto hover:bg-black/10 rounded-full p-1 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* جدول الـ Variants */}
        <div className="bg-gradient-to-l from-white to-primary/5 rounded-3xl shadow-lg p-6 md:p-8 border-2 border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">أنواع المنتج (Variants)</h2>
              <p className="text-gray-500 text-sm">إدارة الأنواع المختلفة للمنتج</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-l from-primary to-primary/90 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <FiPlus className="w-5 h-5" />
              إضافة نوع جديد
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white/50 rounded-2xl border-2 border-dashed border-primary/20">
              <svg className="w-16 h-16 mx-auto mb-4 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg font-medium">لا يوجد أنواع لهذا المنتج</p>
              <p className="text-sm mt-2">اضغط على "إضافة نوع جديد" لإضافة أول نوع</p>
            </div>
          ) : (
            <>
              {/* عرض الجدول للشاشات الكبيرة */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-center border border-primary/30 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-l from-primary to-primary/90 text-white" dir="rtl">
                      <th className="py-4 px-4 font-semibold">السماكة</th>
                      <th className="py-4 px-4 font-semibold">وحدة السماكة</th>
                      <th className="py-4 px-4 font-semibold">الوزن</th>
                      <th className="py-4 px-4 font-semibold">وحدة الوزن</th>
                      <th className="py-4 px-4 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={variant.id} className={`border-b border-primary/20 hover:bg-primary/5 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-4 px-4 font-bold text-gray-800">{variant.thickness}</td>
                        <td className="py-4 px-4">
                          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            {variant.thicknessUnit}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-800">{variant.weight}</td>
                        <td className="py-4 px-4">
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {variant.weightUnit}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2" dir="rtl">
                            <button
                              onClick={() => openEditModal(variant)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors hover:scale-110 transform duration-150"
                              title="تعديل"
                            >
                              <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(variant)}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors hover:scale-110 transform duration-150"
                              title="حذف"
                            >
                              <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* عرض البطاقات للشاشات الصغيرة */}
              <div className="md:hidden grid grid-cols-1 gap-4" dir="rtl">
                {variants.map((variant, index) => (
                  <div 
                    key={variant.id} 
                    className="bg-white rounded-2xl shadow-md border border-primary/20 p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-primary">النوع #{index + 1}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(variant)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">السماكة</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-800">{variant.thickness}</span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            {variant.thicknessUnit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">الوزن</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-800">{variant.weight}</span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {variant.weightUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal للإضافة والتعديل */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  {editingVariant ? <FiEdit className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                  {editingVariant ? "تعديل النوع" : "إضافة نوع جديد"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* نموذج الإدخال */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السماكة *
                    </label>
                    <input
                      type="number"
                      name="thickness"
                      value={formData.thickness}
                      onChange={handleInputChange}
                      required
                      step="0.1"
                      min="0"
                      placeholder="2.5"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وحدة السماكة *
                    </label>
                    <div className="relative">
                      <select
                        name="thicknessUnit"
                        value={formData.thicknessUnit}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-white cursor-pointer pr-10 pl-3 text-right"
                        dir="rtl"
                      >
                        <option value="MM">MM (مليمتر)</option>
                        <option value="CM">CM (سنتيمتر)</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوزن *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      step="0.1"
                      min="0"
                      placeholder="47.8"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وحدة الوزن *
                    </label>
                    <div className="relative">
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-white cursor-pointer pr-10 pl-3 text-right"
                        dir="rtl"
                      >
                        <option value="KG">KG (كيلوجرام)</option>
                        <option value="G">G (جرام)</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        {editingVariant ? <FiEdit className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                        {editingVariant ? "حفظ التعديلات" : "إضافة النوع"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal تعديل المنتج */}
        {showProductModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={closeProductEditModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <FiEdit className="w-5 h-5" />
                  تعديل معلومات المنتج
                </h2>
                <button
                  onClick={closeProductEditModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* نموذج تعديل المنتج */}
              <form onSubmit={handleProductUpdate} className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                      placeholder="أدخل اسم المنتج"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوصف
                    </label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="3"
                      placeholder="أدخل وصف المنتج (اختياري)"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الطول *
                      </label>
                      <input
                        type="number"
                        name="length"
                        value={productForm.length}
                        onChange={handleProductFormChange}
                        required
                        step="0.1"
                        min="0"
                        placeholder="6"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وحدة الطول *
                      </label>
                      <div className="relative">
                        <select
                          name="lengthUnit"
                          value={productForm.lengthUnit}
                          onChange={handleProductFormChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-white cursor-pointer pr-10"
                        >
                          <option value="MM">MM (مليمتر)</option>
                          <option value="CM">CM (سنتيمتر)</option>
                          <option value="M">M (متر)</option>
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={productForm.isActive}
                      onChange={handleProductFormChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      منتج نشط
                    </label>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white font-semibold py-2.5 px-2 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <FiEdit className="hidden sm:block w-5 h-5" />
                        حفظ التعديلات
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeProductEditModal}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal تأكيد الحذف */}
        {showDeleteModal && variantToDelete && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={cancelDelete}
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  تأكيد الحذف
                </h3>
                <p className="text-gray-600 mb-4">
                  هل أنت متأكد من حذف هذا النوع؟
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700">
                    السماكة: {variantToDelete.thickness} {variantToDelete.thicknessUnit}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    الوزن: {variantToDelete.weight} {variantToDelete.weightUnit}
                  </p>
                </div>

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
                    onClick={cancelDelete}
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
