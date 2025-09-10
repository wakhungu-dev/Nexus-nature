// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="w-full bg-black/80 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Nexus Nature</div>
        <div className="flex gap-4 text-sm opacity-90">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}
