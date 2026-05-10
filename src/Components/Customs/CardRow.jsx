export default function CardRow({ title, value, headerKey }) {
  // Check if this is a mapUrl field with a valid URL
  const isMapLink = headerKey === "mapUrl" && value && value !== "-" && typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"));
  
  // Check if this is the variantsCount field
  const isVariantsCount = headerKey === "variantsCount";
  
  return (
    <div className="flex flex-row-reverse justify-between gap-4 items-center py-2">
      {/* العنوان */}
      <span className="font-semibold text-gray-700">{title}</span>

      {/* القيمة */}
      {isMapLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium cursor-pointer no-underline transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          موقع
        </a>
      ) : isVariantsCount ? (
        <span className="inline-flex items-center justify-center min-w-[40px] px-3 py-1 bg-primary/10 text-primary font-bold rounded-full">
          {value ?? 0}
        </span>
      ) : headerKey === "link" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium cursor-pointer no-underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-primary font-bold">{value}</span>
      )}
    </div>
  );
}
