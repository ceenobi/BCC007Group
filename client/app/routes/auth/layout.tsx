import { Suspense, useEffect } from "react";
import { Outlet } from "react-router";
import ImageComponent from "~/components/imageComponent";
import ThemeToggle from "~/components/themeToggle";
import useSlideControl from "~/hooks/useSlideControl";
import { highlightsImgs } from "~/lib/constants";
import { cn } from "~/lib/utils";
import SuspenseUi from "~/components/suspenseUi";
import Logo from "~/components/logo";
import { guestOnlyMiddleware } from "~/middleware/auth.middleware";

export const middleware = [guestOnlyMiddleware];

export default function AuthLayout() {
  const { currentImageIndex, handleNext } = useSlideControl(highlightsImgs);
  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  return (
    <>
      <Suspense fallback={<SuspenseUi />}>
        <section className="relative min-h-dvh w-full">
          <div
            className={cn(
              "hidden lg:block fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-size-[35px_34px] mask-[radial-gradient(ellipse_100%_80%_at_20%_0%,#000_80%,transparent_100%)]",
              "dark:bg-zinc-500 bg-zinc-200",
            )}
          ></div>
          <div className="fixed top-2 flex justify-between items-center w-full z-50 px-4">
            <Logo classname="text-2xl" />
            <ThemeToggle />
          </div>
          <div
            className="relative z-10 min-h-screen items-center justify-center grid grid-cols-12 lg:overflow-hidden"
            data-testid="auth-layout-grid"
          >
            <div className="col-span-12 lg:col-span-6 lg:pt-[58px]">
              <div className="p-4 dark:bg-zinc-900 lg:bg-white lg:rounded-tr-2xl shadow min-h-screen lg:min-h-[calc(100vh-58px)] overflow-hidden flex flex-col justify-center">
                <Outlet />
              </div>
            </div>
            <div className="hidden lg:block col-span-6 mx-auto space-y-10">
              <div className="relative rounded-2xl">
                {highlightsImgs?.map((item, index) => (
                  <div
                    key={item.id}
                    className={`w-[450px] mx-auto rounded-2xl transition-opacity ${
                      index === currentImageIndex
                        ? "fade-enter fade-enter-active opacity-100"
                        : "fade-exit fade-exit-active opacity-0"
                    }`}
                  >
                    {index === currentImageIndex && (
                      <div className="relative">
                        <div
                          className={cn(
                            "rounded-2xl w-[450px] h-[450px] object-cover object-center transition-opacity duration-500",
                            "",
                          )}
                        >
                          <ImageComponent
                            cellValue={item.image}
                            alt="Community"
                            classname="rounded-2xl"
                          />
                        </div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent rounded-2xl w-full h-[450px] object-cover object-center" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="px-1 absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1 rounded-2xl w-[200px]">
                  {highlightsImgs.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-2xl w-[50px] ${
                        index === currentImageIndex
                          ? "bg-lightBlue dark:bg-velvet"
                          : "bg-black/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <article className="flex flex-col gap-2 text-center">
                <h1 className={"text-[2rem] font-bold"}>
                  Fast, Easy & Seemless <br />{" "}
                  <span className="text-lightBlue dark:text-velvet text-[2rem]">
                    Transactions
                  </span>
                </h1>
              </article>
            </div>
          </div>
        </section>
      </Suspense>
    </>
  );
}
