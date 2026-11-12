<script lang="ts">
    // Horizontal timeline — reads the same static/story-data/beats.json export
    // as StoryTimeline.svelte, laid out as parallel per-source streams instead
    // of one chronological feed. Two views of one dataset, kept in sync via
    // $lib/timelineFocus.svelte (click here scrolls the vertical feed there,
    // and vice versa).
    import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { SOURCE_META, computeOrigin, toPhaseSpans, toSourceLanes, type Beat, type BeatSource, type LaneBlock } from "$lib/beats";
    import { timelineFocus, setFocus } from "$lib/timelineFocus.svelte";

    let beats = $state<Beat[]>([]);
    let loaded = $state(false);

    onMount(async () => {
        const res = await fetch(`${base}/story-data/beats.json`);
        beats = await res.json();
        loaded = true;
    });

    const origin = $derived(computeOrigin(beats));
    const DURATION = $derived(Math.max(origin.durationHours, 0.001)); // hours; guard /0 before load
    const lanes = $derived(toSourceLanes(beats, origin.originMs));
    const phaseSpans = $derived(toPhaseSpans(beats, origin.originMs, DURATION));
    const turningPoints = $derived(
        beats.flatMap((b, beatIndex) =>
            b.turning_point ? [{ t: (new Date(b.start).getTime() - origin.originMs) / 3_600_000, beatIndex }] : [],
        ),
    );

    const PX_PER_DAY = 18;
    const TICK_HOURS = 7 * 24;
    const INNER_W = $derived(Math.round((DURATION / 24) * PX_PER_DAY));
    const SOURCES = Object.keys(SOURCE_META) as BeatSource[];

    let scrollEl: HTMLDivElement | undefined = $state();
    let currentHour = $state(0);

    function pct(v: number) {
        return DURATION > 0 ? (v / DURATION) * 100 : 0;
    }
    function idxAt(list: LaneBlock[], t: number) {
        let last = 0;
        for (let i = 0; i < list.length; i++) {
            if (t >= list[i].start) last = i;
            if (t >= list[i].start && t < list[i].end) return i;
        }
        return last;
    }
    function fmt(t: number) {
        return new Date(origin.originMs + t * 3_600_000).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
        });
    }

    const activeIdx = $derived(
        Object.fromEntries(SOURCES.map((s) => [s, idxAt(lanes[s], currentHour)])) as Record<BeatSource, number>,
    );

    // Single entry point for moving the playhead — from a direct click
    // (passes beatIndex, originating a "horizontal" focus for StoryTimeline
    // to follow) or from an incoming sync signal (1-arg, just applying an
    // already-decided focus, not re-broadcasting it).
    function seek(start: number, beatIndex?: number) {
        currentHour = Math.min(start + 0.05, DURATION - 0.01);
        if (beatIndex !== undefined) setFocus(beatIndex, "horizontal");
    }

    // Keep the current block in view whenever the playhead moves.
    $effect(() => {
        const t = currentHour;
        if (!scrollEl) return;
        const x = (t / DURATION) * INNER_W;
        scrollEl.scrollLeft = Math.max(0, x - scrollEl.clientWidth * 0.42);
    });

    // React to the vertical timeline scrolling to a different entry.
    $effect(() => {
        if (timelineFocus.source !== "vertical" || timelineFocus.index === null) return;
        for (const source of SOURCES) {
            const block = lanes[source].find((b) => b.beatIndex === timelineFocus.index);
            if (block) {
                seek(block.start);
                break;
            }
        }
    });
</script>

<div class="anno-figure example-figure">
    {#if loaded && beats.length === 0}
        <p class="empty">No beats in story-data/beats.json.</p>
    {/if}

    <div class="htimeline">
        <div class="htl-body">
            <div class="htl-labels">
                {#if phaseSpans.length}
                    <div class="htl-lbl h-phase">Phase</div>
                {/if}
                <div class="htl-lbl h-months">
                    <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM4 5h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 5v10h16V10H4Z"/></svg></span>Time
                </div>
                {#each SOURCES as source (source)}
                    <div class="htl-lbl h-src">
                        <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={SOURCE_META[source].icon} /></svg></span>{SOURCE_META[source].label}
                    </div>
                {/each}
            </div>

            <div class="htl-scroll" bind:this={scrollEl}>
                <div class="htl-inner" style="width: {INNER_W}px">
                    {#if phaseSpans.length}
                        <div class="htl-track h-phase">
                            {#each phaseSpans as p, i (p.name)}
                                <span
                                    class="htl-phase"
                                    class:on={currentHour >= p.start && currentHour < p.end}
                                    style="left: {pct(p.start)}%; width: {pct(p.end - p.start)}%"
                                >{i + 1}. {p.name}</span>
                            {/each}
                        </div>
                    {/if}
                    <div class="htl-track htl-months h-months">
                        {#each Array(Math.max(1, Math.ceil(DURATION / TICK_HOURS))) as _, i}
                            <span class="htl-month" style="left: {pct(i * TICK_HOURS)}%">{fmt(i * TICK_HOURS)}</span>
                        {/each}
                    </div>

                    {#each SOURCES as source (source)}
                        <div class="htl-track h-src">
                            {#each lanes[source] as e, i}
                                <button
                                    class="htl-block"
                                    class:on={i === activeIdx[source] && currentHour >= e.start && currentHour < e.end}
                                    style="left: {pct(e.start)}%; width: {pct(e.end - e.start)}%; background: var(--series-{source}); color: #fff;"
                                    onclick={() => seek(e.start, e.beatIndex)}
                                >
                                    <span class="htl-block-label">{e.label}</span>
                                </button>
                            {/each}
                        </div>
                    {/each}

                    {#each turningPoints as tp (tp.beatIndex)}
                        <div class="htl-tp" style="left: {pct(tp.t)}%" title="Turning point"></div>
                    {/each}

                    <div class="htl-playhead" style="left: {pct(currentHour)}%"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .example-figure {
        height: 380px;
    }

    /* row heights (shared by labels + tracks) */
    :global(.h-months) {
        flex: 26 1 0;
        min-height: 0;
    }
    :global(.htl-track.h-src),
    :global(.htl-lbl.h-src) {
        flex: 60 1 0;
        min-height: 0;
    }

    /* month/time ruler — ticks are positioned by pct() like the blocks and
       playhead, not equal flex division, so they stay aligned with the real
       (non-uniform) duration instead of drifting off the actual timestamps */
    .htl-months {
        background: var(--card);
    }

    .htl-month {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        padding-left: 5px;
        border-left: 1px solid var(--line);
        font-family: var(--sans);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--mute);
        white-space: nowrap;
    }

    .htl-block {
        min-width: 92px;
    }

    .htl-block-label {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-align: left;
    }

    :global(.h-phase) {
        flex: 30 1 0;
        min-height: 0;
    }
    .htl-phase {
        position: absolute;
        top: 4px;
        bottom: 4px;
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-left: 2px solid var(--clay);
        background: color-mix(in oklab, var(--clay) 8%, transparent);
        font-family: var(--serif);
        font-size: 13px;
        font-weight: 600;
        color: var(--brown);
        white-space: nowrap;
        overflow: hidden;
        transition: background 0.2s ease;
    }
    .htl-phase.on {
        background: color-mix(in oklab, var(--clay) 20%, transparent);
        color: var(--espresso);
    }

    .htl-tp {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 0;
        border-left: 2px dashed var(--clay);
        opacity: 0.55;
        z-index: 4;
        pointer-events: none;
    }

    .empty {
        color: var(--mute);
    }
</style>
