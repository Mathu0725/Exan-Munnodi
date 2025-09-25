import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function PageWrapper({ children, title }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 theme-transition">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <div className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">{children}</div>
      </main>
    </div>
  );
}
