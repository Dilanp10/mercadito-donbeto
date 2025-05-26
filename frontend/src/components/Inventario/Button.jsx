// src/components/Button.jsx
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    ghost: "bg-transparent hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}