// Cross-component sync signal linking ExampleTimeline (horizontal) and
// StoryTimeline (vertical) — both views of the same beats.json export. The
// index is the beat's position in that array, stable across both components
// since they fetch the identical static file independently.

export type FocusSource = "horizontal" | "vertical";

export const timelineFocus = $state<{ index: number | null; source: FocusSource | null }>({
    index: null,
    source: null,
});

export function setFocus(index: number, source: FocusSource) {
    if (timelineFocus.index === index) return; // breaks the cross-component feedback loop
    timelineFocus.index = index;
    timelineFocus.source = source;
}
