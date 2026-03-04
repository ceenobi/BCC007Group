import { Separator } from "./ui/separator";

export default function Error({ error }: { error: Error }) {
  return (
    <>
      <div className="h-[calc(100dvh-200px)] flex flex-col justify-center items-center">
        <div className="bg-slate-50 dark:bg-lightDark border border-slate-300 dark:border-zinc-700 flex flex-col items-center w-full max-w-[500px] mx-auto relative rounded-sm">
          <div className="py-4">
            <h1 className="text-red-500 p-2 w-[130px] text-center font-bold text-2xl">
              ERROR
            </h1>
          </div>
          <Separator className="border" />
          <div className="flex flex-col items-center justify-center h-full p-4">
            <h1 className="text-sm text-center">{error?.message}</h1>
          </div>
        </div>
      </div>
    </>
  );
}
