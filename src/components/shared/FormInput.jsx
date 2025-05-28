import clsx from "clsx";

export default function FormInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  icon = null,
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          "text-sm w-full p-2 pr-11 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-all duration-200",
          "dark:bg-gray-700 dark:text-white dark:border-gray-600",
          {
            "border-red-500 ring-red-300 ring-1": error,
            "border-gray-300 focus:ring-blue-500": !error,
          }
        )}
      />
      {icon && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
      <div className="h-5 mt-1">
        <p
          className={clsx(
            "text-red-400 text-xs transition-all duration-300 ease-in-out",
            error ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          )}
        >
          {error || ""}
        </p>
      </div>
    </div>
  );
}
