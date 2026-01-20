import * as React from "react";

export type SongListItem = {
  path: string;
  title: string;
};

function basename(filePath: string): string {
  // supports both / and \ separators
  const normalized = filePath.replaceAll("\\", "/");
  const last = normalized.split("/").pop();
  return last && last.length > 0 ? last : filePath;
}

function titleFromPath(filePath: string): string {
  const base = basename(filePath);
  // Remove extension for display (e.g., "track.mp3" -> "track")
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

export function SongList(props: {
  filePaths: string[];
  selectedPath?: string;
  onSelect?: (song: SongListItem) => void;
  className?: string;
}) {
  const songs = React.useMemo<SongListItem[]>(
    () =>
      props.filePaths.map((path) => ({
        path,
        title: titleFromPath(path),
      })),
    [props.filePaths],
  );

  if (songs.length === 0) {
    return <div className={props.className}>No songs found.</div>;
  }

  return (
    <div className={props.className}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {songs.map((song) => {
          const isSelected = song.path === props.selectedPath;
          return (
            <li key={song.path} style={{ marginBottom: 6 }}>
              <button
                type="button"
                onClick={() => props.onSelect?.(song)}
                aria-current={isSelected ? "true" : undefined}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: isSelected
                    ? "rgba(80, 160, 255, 0.18)"
                    : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
                title={song.path}
              >
                {song.title}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}