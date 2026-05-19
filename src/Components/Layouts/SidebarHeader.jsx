export default function SidebarHeader() {
  const logo = import.meta.env.VITE_CLOUDINARY_LOGO;
  return (
    <>
      <div className="flex flex-col justify-center items-center gap-0.5 mt-5 mx-3 ">
        <img src={logo} alt="logo" className=""/>
        <h2 className="font-bold text-xl text-primary">لوحة التحكم</h2>
      </div>
      <div className="border-b-[3px] my-4 border-[rgba(253,234,200,1)]"></div>
    </>
  );
}
