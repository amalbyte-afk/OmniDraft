export default function Footer() {
  return (
    <footer className="border-t border-glass-border px-4 py-3">
      <div className="flex items-center justify-between text-xs text-text-secondary/40">
        <span>&copy; {new Date().getFullYear()} OmniDraft</span>
        <span>Powered by AI</span>
      </div>
    </footer>
  );
}
