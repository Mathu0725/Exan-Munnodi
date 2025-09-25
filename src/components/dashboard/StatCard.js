export default function StatCard({ title, value, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="text-sm font-medium text-gray-500 uppercase">{title}</h4>
      {isLoading ? (
        <div className="mt-1 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      )}
    </div>
  );
}
