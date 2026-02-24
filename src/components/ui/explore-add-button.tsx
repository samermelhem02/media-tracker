"use client";

/**
 * Add-to-library button with IMDb-style folded corner (tag shape).
 * White plus on dark background with a small triangular fold at bottom-right.
 */
export function ExploreAddButton({
  isInLibrary,
  isAdding,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  isInLibrary?: boolean;
  isAdding?: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  const isSaved = isInLibrary || isAdding;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="absolute left-2 top-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center overflow-visible focus:outline-none focus:ring-2 focus:ring-white/50 transition-shadow disabled:cursor-not-allowed disabled:opacity-70"
    >
      {/* Main shape: rounded except bottom-right where the fold sits */}
      <span
        className={`flex h-full w-full items-center justify-center rounded-tl-lg rounded-tr-lg rounded-bl-lg transition-shadow ${
          isSaved
            ? "bg-amber-400/90 text-zinc-900 shadow-[0_0_16px_rgba(251,191,36,0.7)] ring-2 ring-amber-300/80"
            : "bg-black/80 text-white hover:bg-black hover:shadow-[0_0_14px_rgba(250,204,21,0.6)] hover:text-yellow-300"
        }`}
      >
        {isSaved ? (
          <span className="text-xl font-bold leading-none">✓</span>
        ) : (
          <span className="text-xl font-light leading-none">+</span>
        )}
      </span>
      {/* Folded corner - dark triangle at bottom-right */}
      <span
        className={`absolute right-0 bottom-0 border-[10px] border-transparent ${
          isSaved ? "border-b-amber-600/90 border-r-amber-600/90" : "border-b-black/90 border-r-black/90"
        }`}
        aria-hidden
        style={{ width: 0, height: 0 }}
      />
    </button>
  );
}
