import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { branchesService, getApiErrorMessage } from "../../services/apiServices";

import { FiBox } from "react-icons/fi";
import { FiImage } from "react-icons/fi";
import { FiMessageSquare } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { FiGlobe } from "react-icons/fi";

export default function BranchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "لوحة التحكم | تفاصيل الفرع";
    loadBranch();
  }, [id]);

  const loadBranch = async () => {
    try {
      setLoading(true);
      const data = await branchesService.getById(id);
      setBranch(data.branch || data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      name: "إدارة المنتجات",
      icon: FiBox,
      path: `/products`,
      color: "bg-blue-500",
    },
    {
      name: "إدارة الصور",
      icon: FiImage,
      path: `/images`,
      color: "bg-green-500",
    },
    {
      name: "إدارة الرسائل",
      icon: FiMessageSquare,
      path: `/messages`,
      color: "bg-yellow-500",
    },
    {
      name: "إدارة الخدمات",
      icon: FiSettings,
      path: `/services`,
      color: "bg-purple-500",
    },
    {
      name: "إدارة المراكز",
      icon: FiMapPin,
      path: `/locations`,
      color: "bg-red-500",
    },
    {
      name: "روابط التواصل",
      icon: FiGlobe,
      path: `/social-links`,
      color: "bg-indigo-500",
    },
  ];

  if (loading) {
    return (
      <div className="bg-[rgba(255,248,235,1)] min-h-screen flex items-center justify-center">
        <p className="text-lg text-primary">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,248,235,1)] min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/branches")}
            className="mb-4 px-4 py-2 bg-primary text-white rounded-2xl hover:bg-opacity-90 transition"
          >
            ← رجوع للفروع
          </button>
          
          {branch && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-primary mb-4">
                تفاصيل الفرع
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">العنوان</p>
                  <p className="font-semibold">{branch.address || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">تفاصيل العنوان</p>
                  <p className="font-semibold">{branch.addressDetails || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">الهاتف</p>
                  <p className="font-semibold">{branch.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">اسم المدير</p>
                  <p className="font-semibold">{branch.managerName || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">رابط الخريطة</p>
                  <p className="font-semibold">
                    {branch.mapUrl ? (
                      <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        عرض الخريطة
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">أوقات العمل</p>
                  <p className="font-semibold">{branch.workingHours || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <h2 className="text-2xl font-bold text-primary mb-6">صفحات الفرع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`${item.color} text-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col items-center justify-center gap-4`}
            >
              <item.icon className="w-16 h-16" />
              <span className="text-xl font-bold">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
