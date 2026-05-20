import { useCallback, useEffect, useState } from "react";
import CardList from "../../Components/Customs/CardList";
import Table from "../../Components/Customs/Table";
import { contactsService, getApiErrorMessage } from "../../services/apiServices";


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

export default function Messages() {
  const [filter, setFilter] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.title = "لوحة التحكم | إدارة الرسائل"
    
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
  
  const loadContacts = useCallback(async () => {
    try {
      const apiStatus = filter === "all" ? undefined : reverseStatusMap[filter];
      const contacts = await contactsService.list(apiStatus);
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

  return (
    <div className={`${isDark ? "bg-[rgba(26,26,46,1)]" : "bg-[rgba(255,248,235,1)]"} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-6 overflow-hidden">
        <div className="my-5 flex flex-row-reverse justify-center ">
          <label
            htmlFor="filterLabel"
            className={`ml-6 bg-primary rounded-2xl p-1.5 text-white font-bold cursor-pointer ${isDark ? "hover:bg-primary/90" : ""}`}
          >
            فلترة حسب الحالة
          </label>
          <select
            className={`px-4 py-2 rounded-2xl border ${isDark ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-700"} shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer`}
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
          <Table headers={headers} data={filteredData} onDeleteRow={handleDelete} onSaveRow={handleSave} isDark={isDark} />
        </div>
        {error ? <p className={`${isDark ? "text-red-400" : "text-red-500"} text-center`}>{error}</p> : null}
        <CardList
          headers={headers}
          data={filteredData}
          order={cardOrder}
          onDeleteRow={handleDelete}
          onSaveRow={handleSave}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
