import { useCallback, useState } from "react";

export default function useSlideControl(arrayPhotos: any[]) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + arrayPhotos?.length) % arrayPhotos?.length
    );
  }, [arrayPhotos?.length]);

  const handleNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % arrayPhotos?.length);
  }, [arrayPhotos?.length]);

  return {
    currentImageIndex,
    handlePrevious,
    handleNext,
  };
}