export default function ComingSoon() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-[50vh]"  >
      <img src="/empty.svg" alt="Coming soon" className="w-50 h-50" />
      <h1 className="text-center text-sm dark:text-white italic">
        This feature is currently not available
      </h1>
    </div>
  );
}
