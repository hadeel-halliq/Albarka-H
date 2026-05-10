import logo2 from "../../images/logo2.png"
export default function SidebarHeader() {
  return (
    <>
      <div className="flex flex-col justify-center items-center gap-1 mt-5 mx-3 ">
        <img src={logo2} alt="logo" />
        <h2 className="font-bold text-3xl text-primary">لوحة التحكم</h2>
      </div>
      <div className="border-b-[3px] my-4 border-[rgba(253,234,200,1)]"></div>
    </>
  );
}
