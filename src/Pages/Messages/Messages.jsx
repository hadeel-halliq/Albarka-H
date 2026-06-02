import { useCallback, useEffect, useState } from "react";
import CardList from "../../Components/Customs/CardList";
import Table from "../../Components/Customs/Table";
import { contactsService, getApiErrorMessage } from "../../services/apiServices";
import { FiX, FiMail, FiCheckCircle, FiAlertCircle, FiEye } from "react-icons/fi";

const headers = [
  { label: "الإجراءات", key: "actions" },
  { label: "الحالة", key: "status" },
  { label: "التاريخ", key: "date" },
  { label: "الموضوع", key: "subject" },
  {
    label: "البريد الإلكتروني",
    key: "email",
    render: (value) => (
      <a href={`mailto:${value}`} className="text-blue-500 cursor-pointer">
        {value}
      </a>
    )
  },
  { label: "اسم المرسل", key: "name" },
];

const cardOrder = ["name", "email", "subject", "date", "status"];
const statusMap = {
  UNREAD: "جديد",
  READ: "مقروء",
  REPLIED: "تم الرد",
};
const reverseStatusMap = {
  "جديد": "UNREAD",
  "مقروء": "READ",
  "تم الرد": "REPLIED",
};

const statusColors = {
  "جديد": "bg-blue-100 text-blue-700 border border-blue-200",
  "مقروء": "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "تم الرد": "bg-green-100 text-green-700 border border-green-200",
};

export default function Messages() {
  const [filter, setFilter] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "لوحة التحكم | إدارة الرسائل";
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const apiStatus = filter === "all" ? undefined : reverseStatusMap[filter];
      const response = await contactsService.list(apiStatus);
      const contacts = response.items || response;
      setFilteredData(
        contacts.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          subject: item.message,
          date: item.createdAt?.slice(0, 10) || "-",
          status: statusMap[item.status] || item.status,
        }))
      );
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [filter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const openMessageModal = (row) => {
    setSelectedMessage(row);
    setSelectedStatus(row.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
    setSelectedStatus("");
  };

  const handleDelete = async (id) => {
    try {
      await contactsService.updateStatus(id, "REPLIED");
      await loadContacts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleSave = async (id, row) => {
    try {
      await contactsService.updateStatus(id, reverseStatusMap[row.status] || "READ");
      await loadContacts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleModalSave = async () => {
    if (!selectedMessage) return;
    setLoading(true);
    try {
      await contactsService.updateStatus(selectedMessage.id, reverseStatusMap[selectedStatus] || "READ");
      setError("تم تحديث حالة الرسالة بنجاح!");
      setTimeout(() => setError(""), 3000);
      await loadContacts();
      handleCloseModal();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[rgba(255,248,235,1)] min-h-screen">
      <div className="container mx-auto px-6 overflow-hidden">

        {error && (
          <div
            className={`p-4 rounded-lg mb-4 mt-4 flex items-center gap-3 ${error.includes("تم")
                ? "bg-green-100 border-r-4 border-green-500 text-green-700"
                : "bg-red-100 border-r-4 border-red-500 text-red-700"
              }`}
            dir="rtl"
          >
            {error.includes("تم") ? (
              <FiCheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold">{error.includes("تم") ? "نجاح!" : "خطأ!"}</p>
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

        <div className="my-5 flex flex-row-reverse justify-center">
          <label
            htmlFor="filterLabel"
            className="ml-6 bg-primary rounded-2xl p-1.5 text-white font-bold cursor-pointer"
          >
            فلترة حسب الحالة
          </label>
          <select
            className="px-4 py-2 rounded-2xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
            id="filterLabel"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">جميع الرسائل</option>
            <option value="جديد">جديد</option>
            <option value="مقروء">مقروء</option>
            <option value="تم الرد">تم الرد</option>
          </select>
        </div>

        <div className="overflow-x-auto hidden md:block rounded-3xl mt-10">
          <Table
            headers={headers}
            data={filteredData}
            onDeleteRow={handleDelete}
            onSaveRow={handleSave}
            onEditRow={openMessageModal}
          />
        </div>

        <CardList
          headers={headers}
          data={filteredData}
          order={cardOrder}
          onDeleteRow={handleDelete}
          onSaveRow={handleSave}
          onEditRow={openMessageModal}
        />

        {/* Message Detail Modal */}
        {showModal && selectedMessage && (
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
                  <FiEye className="w-5 h-5" />
                  تفاصيل الرسالة
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  aria-label="إغلاق"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 lg:p-5">
                <div className="grid grid-cols-1 gap-4">

                  {/* Sender Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      اسم المرسل
                    </label>
                    <p className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 font-medium">
                      {selectedMessage.name}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      البريد الإلكتروني
                    </label>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center gap-2 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-blue-600 hover:text-blue-800 transition-colors"
                      dir="ltr"
                    >
                      <FiMail className="w-4 h-4 flex-shrink-0" />
                      {selectedMessage.email}
                    </a>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      التاريخ
                    </label>
                    <p className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-800">
                      {selectedMessage.date}
                    </p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      الرسالة
                    </label>
                    <p className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 min-h-[80px] whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.subject}
                    </p>
                  </div>

                  {/* Status selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
                    >
                      <option value="جديد">جديد</option>
                      <option value="مقروء">مقروء</option>
                      <option value="تم الرد">تم الرد</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleModalSave}
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
                        <FiCheckCircle className="w-5 h-5" />
                        حفظ الحالة
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    إغلاق
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