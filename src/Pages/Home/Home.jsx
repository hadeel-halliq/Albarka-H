import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import InfoCard from "./Components/InfoCard";
import ChartCard from "./Components/ChatCard";
import { dashboardService, getApiErrorMessage, contactsService, productsService, servicesService, mediaService, branchesService, socialLinksService } from "../../services/apiServices";


const fallbackStats = {
  servicesCount: 0,
  productsCount: 0,
  contactsCount: 0,
  visitorsCount: 0,
  imagesCount: 0,
  branchesCount: 0,
  socialLinksCount: 0,
};

const visitorsData = [
  { month: "كانون الاول", visitors: 700 },
  { month: "تشرين التاني", visitors: 1300 },
  { month: "تشرين الاول", visitors: 1400 },
  { month: "أيلول", visitors: 1700 },
  { month: "آب", visitors: 1900 },
  { month: "حزيران", visitors: 2100 },
  { month: "أيار", visitors: 1900 },
  { month: "نيسان", visitors: 2200 },
  { month: "آذار", visitors: 2200 },
  { month: "شباط", visitors: 2300 },
  { month: "كانون التاني", visitors: 2600 },
];


const messagesData = [
  { month: "كانون الاول", visitors: 300 },
  { month: "تشرين التاني", visitors: 350 },
  { month: "تشرين الاول", visitors: 390 },
  { month: "أيلول", visitors: 400 },
  { month: "آب", visitors: 390 },
  { month: "حزيران", visitors: 400 },
  { month: "أيار", visitors: 399 },
  { month: "نيسان", visitors: 350 },
  { month: "آذار", visitors: 310 },
  { month: "شباط", visitors: 430 },
  { month: "كانون التاني", visitors: 480 },
];

export default function Home() {
  const services = import.meta.env.VITE_CLOUDINARY_services
  const products = import.meta.env.VITE_CLOUDINARY_products
  const message = import.meta.env.VITE_CLOUDINARY_message
  const orangMessage = import.meta.env.VITE_CLOUDINARY_orangMessage
  const visitors = import.meta.env.VITE_CLOUDINARY_visitors
  const line = import.meta.env.VITE_CLOUDINARY_line
  const [stats, setStats] = useState(fallbackStats);
  const [error, setError] = useState("");
  const [messagesData, setMessagesData] = useState([]);

  // Load dashboard stats
  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        // Load all counts in parallel from their respective services
        const [
          dashboardPayload,
          contactsResult,
          productsResult,
          servicesResult,
          imagesResult,
          branches,
          socialLinks
        ] = await Promise.all([
          dashboardService.stats().catch(() => ({})),
          contactsService.list({ page: 1, limit: 1 }).catch(() => ({ items: [], meta: {} })),
          productsService.list({ page: 1, limit: 1 }).catch(() => ({ items: [], meta: {} })),
          servicesService.list({ page: 1, limit: 1, isActive: undefined }).catch(() => ({ items: [], meta: {} })),
          mediaService.list({ page: 1, limit: 1 }).catch(() => ({ items: [], meta: {} })),
          branchesService.list().catch(() => []),
          socialLinksService.list().catch(() => [])
        ]);
        
        if (!mounted) return;
        
        // Extract total counts from meta if available, otherwise use array lengths
        const contacts = contactsResult?.items || [];
        const products = productsResult?.items || [];
        const services = servicesResult?.items || [];
        const images = imagesResult?.items || [];
        
        const contactsTotal = contactsResult?.meta?.total ?? contacts.length ?? dashboardPayload?.contactsCount ?? dashboardPayload?.messages ?? 0;
        const productsTotal = productsResult?.meta?.total ?? products.length ?? dashboardPayload?.productsCount ?? dashboardPayload?.products ?? 0;
        const servicesTotal = servicesResult?.meta?.total ?? services.length ?? dashboardPayload?.servicesCount ?? dashboardPayload?.services ?? 0;
        const imagesTotal = imagesResult?.meta?.total ?? images.length ?? dashboardPayload?.imagesCount ?? dashboardPayload?.images ?? 0;
        
        setStats({
          servicesCount: servicesTotal,
          productsCount: productsTotal,
          contactsCount: contactsTotal,
          visitorsCount: dashboardPayload?.visitorsCount || dashboardPayload?.visitors || 0,
          imagesCount: imagesTotal,
          branchesCount: branches?.length || 0,
          socialLinksCount: socialLinks?.length || 0,
        });
        setError("");
      } catch (err) {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
      }
    };

    loadStats();
    const intervalId = setInterval(loadStats, 30000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Load messages data for chart
  useEffect(() => {
    const loadMessagesData = async () => {
      try {
        const result = await contactsService.list({ page: 1, limit: 100 });
        const items = result.items || [];
        
        // Group messages by month
        const monthlyData = {};
        const monthNames = ["كانون التاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "آب", "أيلول", "تشرين الاول", "تشرين التاني", "كانون الاول"];
        
        items.forEach(item => {
          const date = new Date(item.createdAt);
          const monthIndex = date.getMonth();
          const monthName = monthNames[monthIndex];
          
          if (!monthlyData[monthName]) {
            monthlyData[monthName] = 0;
          }
          monthlyData[monthName]++;
        });
        
        // Convert to array format for chart
        const chartData = monthNames.map(month => ({
          month,
          visitors: monthlyData[month] || 0
        })).filter(item => item.visitors > 0);
        
        setMessagesData(chartData);
      } catch (err) {
        console.error("Failed to load messages data:", err);
      }
    };
    
    loadMessagesData();
  }, []);

  const infoArray = useMemo(
    () => [
      {
        title: "الخدمات",
        icon: services,
        number: String(stats.servicesCount),
        description: "بيانات مباشرة",
        isArrow: false,
        color: "from-orange-400 to-orange-600",
      },
      {
        title: "المنتجات",
        icon: products,
        number: String(stats.productsCount),
        description: "بيانات مباشرة",
        isArrow: false,
        color: "from-blue-400 to-blue-600",
      },
      {
        title: "الرسائل",
        icon: message,
        number: String(stats.contactsCount),
        description: "بيانات مباشرة",
        isArrow: true,
        color: "from-green-400 to-green-600",
      },
      {
        title: "الفروع",
        icon: visitors,
        number: String(stats.branchesCount),
        description: "بيانات مباشرة",
        isArrow: false,
        color: "from-pink-400 to-pink-600",
      },
      {
        title: "روابط التواصل",
        icon: line,
        number: String(stats.socialLinksCount),
        description: "بيانات مباشرة",
        isArrow: false,
        color: "from-purple-400 to-purple-600",
      },
      {
        title: "الصور",
        icon: orangMessage,
        number: String(stats.imagesCount),
        description: "بيانات مباشرة",
        isArrow: false,
        color: "from-teal-400 to-teal-600",
      },
    ],
    [stats]
  );

  return (
    <div className={`bg-[rgba(255,248,235,1)] min-h-screen py-8 transition-colors duration-300`}>
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className={`text-4xl font-bold mb-2 text-gray-800`}>لوحة التحكم الرئيسية</h1>
          <p className={`text-gray-600`}>نظرة عامة على إحصائيات الموقع</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {infoArray.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InfoCard
                title={card.title}
                icon={card.icon}
                number={card.number}
                description={card.description}
                isArrow={card.isArrow}
                gradient={card.color}
              />
            </motion.div>
          ))}
        </div>
        
        {error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-center mb-6"
          >
            {error}
          </motion.div>
        ) : null}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ChartCard
              title="إحصائيات الرسائل الشهرية"
              icon={orangMessage}
              data={messagesData.length > 0 ? messagesData : messagesData}
              type="bar"
              color="rgba(105, 166, 206, 1)"
              yDomain={[0, Math.max(...(messagesData.map(d => d.visitors)), 10)]}
              barSize={44}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ChartCard
              title="إحصائيات الزوار الشهرية"
              icon={line}
              data={visitorsData}
              type="area"
              color="#FFA500"
              yDomain={[500, 3000]}
              yTicks={[500, 1500, 2000, 2500, 3000]}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
