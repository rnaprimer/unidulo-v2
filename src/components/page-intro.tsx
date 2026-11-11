export function PageIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="display max-w-[22ch] text-4xl">{title}</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-muted">{children}</p>
      </div>
    </div>
  );
}
