// Shared shape for the research-activity export both timeline views render:
// StoryTimeline.svelte (vertical, chronological feed) and ExampleTimeline.svelte
// (horizontal, replay/scrub). Single source of truth so the two stay in sync.

export type ChainStep = { lane: string; summary: string; editType?: string | null };

export type BeatSource = "recording" | "claude_code" | "slack" | "google_drive" | "github" | "overleaf";

export type Beat = {
    source: BeatSource;
    start: string; // ISO
    end: string; // ISO
    duration_sec: number;
    actor?: string | null;
    target?: string | null;
    label: string;
    content: any;
};

export const SOURCE_META: Record<BeatSource, { label: string; icon: string }> = {
    google_drive: { label: "Google Drive", icon: "M10 4h4l2 3h8v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Z" },
    slack: { label: "Slack", icon: "M8 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 5V6a2 2 0 0 1 2-2Z" },
    github: { label: "GitHub", icon: "M9 4a3 3 0 1 1-2 5.2V15a4 4 0 0 0 4 4h3.3a3 3 0 1 1 0 2H11a6 6 0 0 1-6-6V9.2A3 3 0 0 1 9 4Zm10 0a3 3 0 1 1-1 5.83V12h-2V9.83A3 3 0 0 1 19 4Z" },
    overleaf: { label: "Overleaf", icon: "M8 2h10l4 4v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 8h8v2h-8v-2Zm0 4h8v2h-8v-2Zm0 4h6v2h-6v-2Z" },
    claude_code: { label: "Claude Code", icon: "M4 5h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 5 4 3.5L7 17v-2.4l2.2-1.1L7 12.4V10Zm7 6h6v2h-6v-2Z" },
    recording: { label: "Recording", icon: "M4 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8v2h4v2H8v-2h4v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" },
};

export type LaneBlock = { start: number; end: number; label: string; beat: Beat; beatIndex: number };

export function computeOrigin(beats: Beat[]): { originMs: number; durationHours: number } {
    if (beats.length === 0) return { originMs: 0, durationHours: 0 };
    const originMs = Math.min(...beats.map((b) => new Date(b.start).getTime()));
    const endMs = Math.max(...beats.map((b) => new Date(b.end).getTime()));
    return { originMs, durationHours: (endMs - originMs) / 3_600_000 };
}

export function toSourceLanes(beats: Beat[], originMs: number): Record<BeatSource, LaneBlock[]> {
    const lanes = Object.fromEntries(
        (Object.keys(SOURCE_META) as BeatSource[]).map((s) => [s, [] as LaneBlock[]]),
    ) as Record<BeatSource, LaneBlock[]>;
    beats.forEach((beat, beatIndex) => {
        lanes[beat.source].push({
            start: (new Date(beat.start).getTime() - originMs) / 3_600_000,
            end: (new Date(beat.end).getTime() - originMs) / 3_600_000,
            label: beat.label,
            beat,
            beatIndex,
        });
    });
    for (const source of Object.keys(lanes) as BeatSource[]) {
        lanes[source].sort((a, b) => a.start - b.start);
    }
    return lanes;
}
