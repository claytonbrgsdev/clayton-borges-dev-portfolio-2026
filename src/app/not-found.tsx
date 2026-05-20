import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs tracking-widest uppercase opacity-30 block mb-6">404</span>
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Page not found</h1>
      <p className="opacity-40 mb-10 font-mono text-sm">
        This page does not exist or has been moved.
      </p>
      <Link
        href="/en"
        className="px-8 py-3 border border-white/30 font-mono text-sm tracking-wide hover:border-white/70 transition-colors"
      >
        ← Go home
      </Link>
    </div>
  );
}
