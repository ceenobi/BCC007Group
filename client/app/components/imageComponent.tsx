import { getCloudinaryImage } from "~/lib/utils";

export default function ImageComponent({
  cellValue,
  alt,
  classname,
}: {
  cellValue: string;
  alt: string;
  classname?: string;
}) {
  return (
    <div className="relative aspect-square w-full h-full rouned-sm">
      <img
        style={{
          background: "rgba(0,0,0,0.05)",
          transition: "opacity 0.3s ease",
        }}
        onLoad={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        src={getCloudinaryImage(cellValue as string, 600, 600)}
        srcSet={`
              ${getCloudinaryImage(cellValue as string, 400, 400)} 400w,
              ${getCloudinaryImage(cellValue as string, 800, 800)} 800w,
              ${getCloudinaryImage(cellValue as string, 1200, 1200)} 1200w,
            `}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt || "Image illustration"}
        className={`w-full h-full object-cover object-center ${classname}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
