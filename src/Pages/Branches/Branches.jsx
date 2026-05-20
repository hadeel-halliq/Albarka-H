import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../../images/searchIcon.png";
import Table from "../../Components/Customs/Table";
import CardList from "../../Components/Customs/CardList";
import {
  getApiErrorMessage,
  branchesService,
} from "../../services/apiServices";
import { FiX, FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiAlertCircle, FiMapPin } from "react-icons/fi";


const headers = [
  { key: "actions", label: "الإجراءات" },
  {
    key: "mapUrl",
    label: "الموقع",
    render: (value) => {
      if (!value || value === "-") {
        return <span className="text-gray-400">-</span>;
      }

      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <FiMapPin className="w-4 h-4" />
          موقع
        </a>
      );
    },
  },
  { key: "address", label: "العنوان" },
  { key: "phone", label: "الهاتف" },
  { key: "workingHours", label: "أوقات العمل" },
  { key: "managerName", label: "اسم المدير" },


];

const cardOrder = ["address", "phone", "managerName", "workingHours", "mapUrl"];

export default function Branches() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    addressDetails: "",
    phone: "",
    managerName: "",
    mapUrl: "",
    workingHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
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

  const loadBranches = async () => {
    try {
      const branches = await branchesService.list();
      const tableRows = branches.map((branch) => ({
        id: branch.id,
        address: branch.address || "-",
        phone: branch.phone || "-",
        managerName: branch.managerName || "-",
        workingHours: branch.workingHours || "-",
        mapUrl: branch.mapUrl || "",
        _raw: branch,
      }));
      setRows(tableRows);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    document.title = "لوحة التحكم | إدارة الفروع";
    loadBranches();
  }, []);

  const openAddModal = () => {
    setEditingBranch(null);
    setFormData({
      address: "",
      addressDetails: "",
      phone: "",
      managerName: "",
      mapUrl: "",
      workingHours: "",
    });
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      address: branch.address || "",
      addressDetails: branch.addressDetails || "",
      phone: branch.phone || "",
      managerName: branch.managerName || "",
      mapUrl: branch.mapUrl || "",
      workingHours: branch.workingHours || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBranch(null);
    setFormData({
      address: "",
      addressDetails: "",
      phone: "",
      managerName: "",
      mapUrl: "",
      workingHours: "",
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
      if (editingBranch) {
        await branchesService.update(editingBranch.id, formData);
        setError("تم تعديل الفرع بنجاح!");
        setTimeout(() => setError(""), 3000);
      } else {
        const result = await branchesService.create(formData);
        console.log('New branch created:', result);
        setError("تم إضافة الفرع بنجاح!");
        setTimeout(() => setError(""), 3000);
      }
      await loadBranches();
      handleCloseModal();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      console.error('Error submitting form:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete || !branchToDelete.id) return;
    try {
      await branchesService.remove(branchToDelete.id);
      setError("تم حذف الفرع بنجاح!");
      setTimeout(() => setError(""), 3000);
      await loadBranches();
      setShowDeleteModal(false);
      setBranchToDelete(null);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      setShowDeleteModal(false);
      setBranchToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBranchToDelete(null);
  };

  const handleSave = async (id, editedRow) => {
    try {
      await branchesService.update(id, {
        address: editedRow.address,
        addressDetails: editedRow.addressDetails,
        phone: editedRow.phone,
        managerName: editedRow.managerName,
        mapUrl: editedRow.mapUrl,
        workingHours: editedRow.workingHours,
      });
      setError("تم حفظ التعديلات بنجاح!");
      setTimeout(() => setError(""), 3000);
      await loadBranches();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
    }
  };

  const filteredRows = rows.filter((row) =>
    String(row.address).toLowerCase().includes(search.toLowerCase()) ||
    String(row.phone).includes(search) ||
    String(row.managerName).toLowerCase().includes(search.toLowerCase()) ||
    String(row.workingHours).toLowerCase().includes(search.toLowerCase())
  );

  const headersWithMap = [
    ...headers
  ];

  return (
    <div className={`${isDark ? "bg-[rgba(26,26,46,1)]" : "bg-[rgba(255,248,235,1)]"} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col-reverse gap-4 items-center sm:flex sm:flex-row sm:justify-between my-4">
          <button
            className="w-44 bg-primary text-white font-bold py-2 rounded-2xl cursor-pointer hover:bg-primary/90 transition-all"
            onClick={openAddModal}
          >
            إضافة فرع جديد+
          </button>
          <div className="relative w-44 flex">
            <img
              src={searchIcon}
              alt="search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4"
            />
            <input
              type="text"
              placeholder="ابحث عن فرع ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full border-[1px] border-primary pr-8 pl-2 py-1 rounded-2xl focus:outline-none focus:border-primary focus:border-2 ${isDark ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
              dir="rtl"
            />
          </div>
        </div>
        {error && (
          <div className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${error.includes('تم') ? 'bg-green-100 border-r-4 border-green-500 text-green-700' : 'bg-red-100 border-r-4 border-red-500 text-red-700'
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

        <div className="overflow-x-auto hidden md:block rounded-3xl mt-10">
          <Table
            headers={headersWithMap}
            data={filteredRows}
            onDeleteRow={handleDelete}
            onSaveRow={handleSave}
            onEditRow={openEditModal}
            rowIdKey="id"
            isDark={isDark}
          />
        </div>

        <CardList
          headers={[...headers,]}
          data={filteredRows}
          order={cardOrder}
          onDeleteRow={handleDelete}
          onSaveRow={handleSave}
          onEditRow={openEditModal}
          rowIdKey="id"
          isDark={isDark}
        />

        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg relative animate-slideUp"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-primary/10 px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  {editingBranch ? (
                    <>
                      <FiEdit className="w-5 h-5" />
                      تعديل الفرع
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5" />
                      إضافة فرع جديد
                    </>
                  )}
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
              <form onSubmit={handleSubmit} className="p-4 lg:p-2">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="123 شارع ستيل، بيروت"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تفاصيل العنوان
                    </label>
                    <input
                      type="text"
                      name="addressDetails"
                      value={formData.addressDetails}
                      onChange={handleInputChange}
                      placeholder="الطابق الأرضي، بالقرب من الدوار الرئيسي"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الهاتف *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="\+?[0-9\s\-]{7,20}"
                        placeholder="+96170123456"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr text-right"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم المدير *
                      </label>
                      <input
                        type="text"
                        name="managerName"
                        value={formData.managerName}
                        onChange={handleInputChange}
                        required
                        placeholder="كريم منصور"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الخريطة
                    </label>
                    <input
                      type="url"
                      name="mapUrl"
                      value={formData.mapUrl}
                      onChange={handleInputChange}
                      placeholder="https://maps.google.com/?q=33.8938,35.5018"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr text-right"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أوقات العمل *
                    </label>
                    <input
                      type="text"
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleInputChange}
                      required
                      placeholder="Mon–Sat 08:00–18:00"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white font-semibold py-2.5 px-2 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {editingBranch ? <FiEdit className="hidden sm:block w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                        {editingBranch ? "حفظ التعديلات" : "إضافة الفرع"}
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

        {showDeleteModal && branchToDelete && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={cancelDelete}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-slideUp"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  تأكيد الحذف
                </h3>
                <p className="text-gray-600 mb-4">
                  هل أنت متأكد من حذف هذا الفرع؟
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700">
                    {branchToDelete.address}
                  </p>
                  {branchToDelete.phone && branchToDelete.phone !== "-" && (
                    <p className="text-xs text-gray-500 mt-1">{branchToDelete.phone}</p>
                  )}
                  {branchToDelete.managerName && branchToDelete.managerName !== "-" && (
                    <p className="text-xs text-gray-500 mt-1">المدير: {branchToDelete.managerName}</p>
                  )}
                </div>

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



