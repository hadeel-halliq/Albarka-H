export default function CardRow({ title, value, headerKey }) {
  const isMapLink = headerKey === "mapUrl" && value && value !== "-" && typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
  const isVariantsCount = headerKey === "variantsCount";
  const isPhone = headerKey === "phone";
  
  return (
    <div className="flex flex-row justify-between gap-4 items-center py-1.5">
      {/* العنوان */}
      <span className="text-xs font-medium text-gray-500">{title}</span>

      {/* القيمة */}
      {isMapLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm cursor-pointer no-underline transition-colors hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          عرض الموقع
        </a>
      ) : isVariantsCount ? (
        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm">
          {value ?? 0}
        </span>
      ) : headerKey === "link" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium text-sm cursor-pointer no-underline hover:underline"
        >
          {value}
        </a>
      ) : isPhone ? (
        <span className="text-sm font-semibold text-gray-800 ltr text-right" dir="ltr">{value}</span>
      ) : (
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      )}
    </div>
  );
}