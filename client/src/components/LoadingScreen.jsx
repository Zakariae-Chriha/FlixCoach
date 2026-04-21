export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-dark-600 border-t-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your coach...</p>
      </div>
    </div>
  );
}
