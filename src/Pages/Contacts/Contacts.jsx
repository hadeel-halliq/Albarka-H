import { useState, useEffect } from "react";
import { Mail, Phone, User, Calendar, CheckCircle, Eye, MessageSquare, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { contactsService } from "../../services/apiServices";
import { getApiErrorMessage } from "../../services/apiServices";
import CustomTable from "../../Components/Customs/Table";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 0 });
  const rowsPerPage = 10;

  const statusColors = {
    UNREAD: "bg-red-100 text-red-800 border-red-200",
    READ: "bg-blue-100 text-blue-800 border-blue-200",
    REPLIED: "bg-green-100 text-green-800 border-green-200",
  };

  const statusLabels = {
    UNREAD: "غير مقروء",
    READ: "مقروء",
    REPLIED: "تم الرد",
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { 
        page: currentPage, 
        limit: rowsPerPage,
        ...(statusFilter !== "all" && { status: statusFilter })
      };
      const response = await contactsService.list(params);
      const items = response.items || [];
      const metadata = response.meta || {};
      setContacts(items);
      setMeta({
        page: metadata.page || currentPage,
        limit: metadata.limit || rowsPerPage,
        totalItems: metadata.totalItems || 0,
        totalPages: metadata.totalPages || 0
      });
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [statusFilter, currentPage]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await contactsService.updateStatus(id, newStatus);
      await loadContacts();
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const openDetails = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    if (contact.status === "UNREAD") {
      handleStatusChange(contact.id, "READ");
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.message?.toLowerCase().includes(query) ||
      contact.phone?.includes(query)
    );
  });

  const headers = [
    { key: "name", label: "الاسم", sortable: true },
    { key: "email", label: "البريد الإلكتروني", sortable: true },
    { key: "phone", label: "الهاتف", sortable: false },
    { 
      key: "status", 
      label: "الحالة", 
      sortable: true,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
          {statusLabels[value] || value}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "تاريخ الإرسال", 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    },
  ];

  const cardOrder = ["name", "email", "phone", "status", "createdAt"];

  const renderCardField = (key, item) => {
    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">{item.name}</span>
          </div>
        );
      case "email":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            {item.email}
          </div>
        );
      case "phone":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            {item.phone}
          </div>
        );
      case "status":
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}>
            {statusLabels[item.status] || item.status}
          </span>
        );
      case "createdAt":
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {new Date(item.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </div>
        );
      default:
        return item[key];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 overflow-hidden py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الرسائل</h1>
          <p className="text-gray-600 mt-1">عرض ومتابعة رسائل العملاء</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">تصفية حسب الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">الكل</option>
            <option value="UNREAD">غير مقروء</option>
            <option value="READ">مقروء</option>
            <option value="REPLIED">تم الرد</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">رسائل جديدة</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === "UNREAD").length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">رسائل مقروءة</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === "READ").length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">تم الرد عليها</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === "REPLIED").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Contacts Table/Cards */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم، البريد، الهاتف أو الرسالة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>عرض {filteredContacts.length} من {meta.totalItems} رسالة</span>
          </div>
        </div>

        {/* Table for desktop - Clickable rows */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {headers.map((header) => (
                    <th key={header.key} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-gray-500">
                      لا توجد رسائل تطابق بحثك
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      onClick={() => openDetails(contact)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      {headers.map((header) => {
                        // Render cell content directly based on header configuration
                        let cellContent;
                        if (header.render && typeof header.render === 'function') {
                          cellContent = header.render(contact[header.key]);
                        } else {
                          cellContent = contact[header.key];
                        }
                        
                        return (
                          <td key={header.key} className="px-6 py-4 whitespace-nowrap">
                            {cellContent}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(contact);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards for mobile */}
        <div className="md:hidden space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد رسائل تطابق بحثك</p>
            </div>
          ) : (
            filteredContacts.map((contact, index) => (
              <div
                key={contact.id || index}
                onClick={() => openDetails(contact)}
                className="bg-white rounded-lg shadow p-4 border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderLeftColor: contact.status === 'UNREAD' ? '#ef4444' : contact.status === 'READ' ? '#3b82f6' : '#22c55e' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{contact.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[contact.status]}`}>
                    {statusLabels[contact.status]}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {contact.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {contact.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(contact.createdAt).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-700 line-clamp-2">{contact.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6" dir="rtl">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>
            
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
              disabled={currentPage === meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">تفاصيل الرسالة</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Sender Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">الاسم</p>
                    <p className="font-semibold">{selectedContact.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-semibold">{selectedContact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">الهاتف</p>
                    <p className="font-semibold">{selectedContact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإرسال</p>
                    <p className="font-semibold">
                      {new Date(selectedContact.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">حالة الرسالة</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedContact.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[selectedContact.status] || selectedContact.status}
                  </span>
                  
                  {/* Status Change Buttons */}
                  <div className="flex gap-2 ml-auto">
                    {selectedContact.status !== "READ" && (
                      <button
                        onClick={() => handleStatusChange(selectedContact.id, "READ")}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        تعيين كمقروء
                      </button>
                    )}
                    {selectedContact.status !== "REPLIED" && (
                      <button
                        onClick={() => handleStatusChange(selectedContact.id, "REPLIED")}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        تعيين كتم الرد
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">نص الرسالة</p>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
