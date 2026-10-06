export const metadata = { title: "Administration | Calmora", robots: { index: false, follow: false } };
export default function AdminLayout({ children }) {
  return <div className="min-h-screen bg-stone-100">{children}</div>;
}
