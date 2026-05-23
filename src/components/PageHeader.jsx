export default function PageHeader({ title, action, children }) {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl px-6 py-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {action && (
          <button
            onClick={action.onClick}
            className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {action.label}
          </button>
        )}
      </div>

      {children && (
        <div className="mt-4 flex flex-wrap gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
