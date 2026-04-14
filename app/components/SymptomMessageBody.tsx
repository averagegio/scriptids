/** Minimal **bold** and bullet rendering for assistant markdown-lite */

export function SymptomMessageBody({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 whitespace-pre-wrap break-words">
      {lines.map((line, i) => {
        const bullet = line.match(/^-\s+(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="shrink-0">•</span>
              <span>
                <InlineBold text={bullet[1]} muted={isUser} />
              </span>
            </div>
          );
        }
        const sub = line.match(/^\s{2}-\s+\*Note:\*\s+(.*)$/);
        if (sub) {
          return (
            <p key={i} className="pl-6 text-xs opacity-90">
              <span className="font-medium">Note:</span>{" "}
              <InlineBold text={sub[1]} muted={isUser} />
            </p>
          );
        }
        if (!line.trim()) return <br key={i} />;
        return (
          <p key={i}>
            <InlineBold text={line} muted={isUser} />
          </p>
        );
      })}
    </div>
  );
}

function InlineBold({ text, muted }: { text: string; muted: boolean }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className={muted ? "font-semibold text-white" : ""}>
            {part}
          </strong>
        ) : (
          <span key={j}>{part}</span>
        ),
      )}
    </>
  );
}
