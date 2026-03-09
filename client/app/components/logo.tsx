import { useNavigate } from "react-router";

export default function Logo({
  classname,
  color,
  isOpenSidebar,
}: {
  classname?: string;
  color?: string;
  isOpenSidebar?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <h1
      className={`w-fit font-bold cursor-pointer ${classname}`}
      onClick={() => navigate("/")}
    >
      {isOpenSidebar && (
        <>
          <span
            className={`${color ? color : "text-lightBlue dark:text-velvet italic"}`}
          >
            BCC
          </span>
          007
        </>
      )}
      {!isOpenSidebar && (
        <>
          <span
            className={`${color ? color : "text-lightBlue dark:text-velvet italic"}`}
          >
            BCC
          </span>
        </>
      )}
    </h1>
  );
}
