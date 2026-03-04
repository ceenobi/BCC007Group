import { Button } from "./ui/button";

interface ActionButtonProps {
  type?: "button" | "submit" | "reset" | undefined;
  loading?: boolean;
  text?: React.ReactNode;
  classname?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  form?: string;
  size?: "default" | "sm" | "lg";
}

export default function ActionButton({
  type,
  loading,
  text,
  classname,
  onClick,
  disabled,
  children,
  variant,
  form,
  size,
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`cursor-pointer transition-transform rounded-sm duration-300 ease-in-out ${classname}`}
      variant={variant}
      form={form}
      size={size}
    >
      {loading && <>{children}</>}
      {text}
    </Button>
  );
}
