import { Link } from "react-router-dom";

export default function DashboardMenu({ links }) {
  return (
    <nav className="space-y-5">
      {links.map((link, index) => (
        <div key={index} className="flex justify-end items-center">
          <div
            className={`group flex items-center gap-3 px-3 py-1 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:shadow-sm hover:-translate-x-1`}
          >
            <Link
              to={link.to}
              className={`font-bold text-sm text-gray-700 group-hover:text-primary transition-colors duration-300`}
            >
              {link.name}
            </Link>
            <link.icon className={`w-[24px] h-[24px] text-gray-500 group-hover:text-primary group-hover:scale-110 transition-all duration-300`} />
          </div>
        </div>
      ))}
    </nav>
  );
}

