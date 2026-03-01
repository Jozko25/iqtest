import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="px-4 py-4 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-center gap-4 text-xs text-zinc-500">
        <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-400">
          Terms
        </Link>
        <span className="text-zinc-700">·</span>
        <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-400">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
