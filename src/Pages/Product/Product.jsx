import { useEffect, useState } from "react";
import searchIcon from "../../images/searchIcon.png";
import Table from "../../Components/Customs/Table";
import CardList from "../../Components/Customs/CardList";
import { FiTrash2, FiX, FiPlus, FiEdit } from "react-icons/fi";
import {
  getApiErrorMessage,
  productsService,
  variantsService,
} from "../../services/apiServices";

const headers = [
  { key: "actions", label: "الإجراءات" },
  { key: "status", label: "الحالة" },
  { 
    key: "variantsCount", 
    label: "عدد الأنواع",
    render: (value) => (
      <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-primary/10 text-primary font-bold rounded-full">
        {value ?? 0}
      </span>
    )
  },
  { key: "dimensions", label: "الأبعاد" },
  { key: "description", label: "الوصف" },
  { key: "name", label: "اسم المنتج" },
];

const cardOrder = [
  "name",
  "description",
  "dimensions",
  "variantsCount",
  "status",
];

export default function Product() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    description: "",
    length: "6",
    lengthUnit: "MM",
    isActive: true,
  });

  const loadProducts = async () => {
    try {
      const products = await productsService.list();
      const productsWithVariants = await Promise.all(
        products.map(async (product) => {
          try {
            const variantsData = await variantsService.listByProduct(product.id);
      
            const variantsArray = Array.isArray(variantsData?.variants)
              ? variantsData.variants
              : Array.isArray(variantsData)
              ? variantsData
              : [];
      
            return {
              ...product,
              variantsCount: variantsArray.length,
            };
          } catch (err) {
            console.error(`Failed to load variants for product ${product.id}:`, err);
      
            return {
              ...product,
              variantsCount: 0,
            };
          }
        })
      );

      const tableRows = productsWithVariants.map((product) => ({
        id: product.id,
        name: product.name || "-",
        description: product.description ? (product.description.length > 50 ? product.description.substring(0, 50) + "..." : product.description) : "-",
        dimensions: `${product.length} ${product.lengthUnit || "MM"}` || "-",
        status: product.isActive ? "نشط" : "غير نشط",
        variantsCount: product.variantsCount,
        _raw: product,
      }));

      setRows(tableRows);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    document.title = "لوحة التحكم | إدراة المنتجات";
    loadProducts();
  }, []);

  const handleAdd = () => {
    setNewProductForm({
      name: "",
      description: "",
      length: "6",
      lengthUnit: "MM",
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewProductForm({
      name: "",
      description: "",
      length: "6",
      lengthUnit: "MM",
      isActive: true,
    });
  };

  const handleNewProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productsService.create({
        name: newProductForm.name,
        description: newProductForm.description,
        length: parseFloat(newProductForm.length),
        lengthUnit: newProductForm.lengthUnit.toUpperCase(),
        isActive: newProductForm.isActive,
      });
      await loadProducts();
      handleCloseAddModal();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDelete = (row) => {
    const targetRow = row?._raw || row;
    setProductToDelete(targetRow);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productsService.update(productToDelete.id, { isActive: false });
      await loadProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleEdit = (row) => {
    window.location.href = `/products/${row.id}`;
  };

  const filteredRows = rows.filter((row) =>
    String(row.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[rgba(255,248,235,1)] min-h-screen">
      <div className="container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col-reverse gap-4  items-center sm:flex sm:flex-row sm:justify-between my-4">
          <button
            className="w-44 bg-primary text-white font-bold py-2 rounded-2xl cursor-pointer hover:bg-primary/90 transition-all"
            onClick={handleAdd}
          >
            إضافة منتج جديد +
          </button>
          <div className="relative w-44 flex">
            <img
              src={searchIcon}
              alt="search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4"
            />
            <input
              type="text"
              placeholder=" ابحث ضمن المحتوى..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-[1px] border-primary pr-8 pl-2 py-1 rounded-2xl focus:outline-none focus:border-primary focus:border-2"
              dir="rtl"
            />
          </div>
        </div>
        {error ? <p className="text-red-500 text-center">{error}</p> : null}

        <div className="overflow-x-auto hidden md:block rounded-3xl mt-10">
          <Table
            headers={headers}
            data={filteredRows}
            onDeleteRow={handleDelete}
            onEditRow={handleEdit}
            rowIdKey="id"
          />
        </div>
        <CardList
          headers={headers}
          data={filteredRows}
          order={cardOrder}
          onDeleteRow={handleDelete}
          onEditRow={handleEdit}
          rowIdKey="id"
        />

        {/* Modal إضافة منتج جديد */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleCloseAddModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <FiPlus className="w-5 h-5" />
                  إضافة منتج جديد
                </h2>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* نموذج إضافة المنتج */}
              <form onSubmit={handleCreateProduct} className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProductForm.name}
                      onChange={handleNewProductFormChange}
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
                      value={newProductForm.description}
                      onChange={handleNewProductFormChange}
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
                        value={newProductForm.length}
                        onChange={handleNewProductFormChange}
                        required
                        step="0.1"
                        min="0"
                        placeholder="6"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr text-right"
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
                          value={newProductForm.lengthUnit}
                          onChange={handleNewProductFormChange}
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
                      checked={newProductForm.isActive}
                      onChange={handleNewProductFormChange}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                      منتج نشط
                    </label>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    إضافة المنتج
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
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
        {showDeleteModal && productToDelete && (
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
                  هل أنت متأكد من حذف هذا المنتج؟
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700">
                    {productToDelete.name}
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
