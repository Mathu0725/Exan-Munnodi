export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-lg">If you can see this, the app directory is working!</p>
        <a href="/login-3d" className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Go to 3D Login
        </a>
      </div>
    </div>
  );
}
