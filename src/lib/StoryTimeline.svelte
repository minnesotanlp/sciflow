<script lang="ts">
    // Vertical auto-scrolling research-activity timeline. Ported from
    // scripts/story-export/preview/{index.html,app.js,style.css} in the
    // scholawrite-2 repo, where it was prototyped against a real (de-identified)
    // export before landing here. Reads only static/story-data/beats.json — a
    // pre-redacted, pre-clustered export; this component never talks to S3 or
    // any backend.
    import { onMount, onDestroy } from "svelte";
    import { base } from "$app/paths";
    import { SOURCE_META, type Beat, type ChainStep } from "$lib/beats";
    import { timelineFocus, setFocus } from "$lib/timelineFocus.svelte";

    const CHAIN_ICON: Record<string, string> = { user_prompt: "👤", assistant_reply: "🤖", tool_call: "🔧" };

    const FADE_ZONE_PX = 70;
    const AUTOSCROLL_PX_PER_SEC = 26;
    const RESUME_AFTER_MS = 2500;

    let beats = $state<Beat[]>([]);
    let loaded = $state(false);
    let boxEl: HTMLDivElement;
    let scrollerEl: HTMLDivElement;
    let rowEls: HTMLDivElement[] = [];

    // `bind:this={rowEls[i]}` inside #each warns ("non-reactive property") since
    // rowEls itself isn't $state — an action avoids that, and the fade loop only
    // ever reads rowEls, it doesn't need reactivity to trigger re-renders.
    function collectRow(node: HTMLDivElement, index: number) {
        rowEls[index] = node;
        return { destroy: () => { if (rowEls[index] === node) delete rowEls[index]; } };
    }

    function byline(beat: Beat) {
        return [beat.actor, beat.target].filter(Boolean).join(" · ");
    }

    function fmtTime(iso: string) {
        return new Date(iso).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function claudeHead(beat: Beat): ChainStep | undefined {
        return beat.content.steps?.[0];
    }
    function claudeChain(beat: Beat): ChainStep[] {
        return beat.content.steps?.slice(1) ?? [];
    }

    let raf = 0;
    let lastFrame: number | null = null;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    function pauseTemporarily() {
        paused = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
            paused = false;
        }, RESUME_AFTER_MS);
    }

    function applyFade() {
        if (!boxEl) return;
        const boxRect = boxEl.getBoundingClientRect();
        const centerY = boxRect.top + boxRect.height / 2;
        let closestIdx = -1;
        let closestDist = Infinity;
        for (let i = 0; i < rowEls.length; i++) {
            const row = rowEls[i];
            if (!row) continue;
            const r = row.getBoundingClientRect();
            const distTop = r.bottom - boxRect.top;
            const distBottom = boxRect.bottom - r.top;
            const nearest = Math.min(distTop, distBottom, FADE_ZONE_PX);
            row.style.opacity = String(Math.max(0, Math.min(1, nearest / FADE_ZONE_PX)));

            const dist = Math.abs((r.top + r.bottom) / 2 - centerY);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        // Tell ExampleTimeline which entry is focal — setFocus() no-ops if
        // it's already the shared focus, so this is cheap once scrolling settles.
        if (closestIdx !== -1) setFocus(closestIdx, "vertical");
    }

    function tick(now: number) {
        if (lastFrame == null) lastFrame = now;
        const dt = (now - lastFrame) / 1000;
        lastFrame = now;

        if (!paused && scrollerEl) {
            const atBottom = scrollerEl.scrollTop + scrollerEl.clientHeight >= scrollerEl.scrollHeight - 1;
            if (atBottom) {
                scrollerEl.scrollTop = 0;
            } else {
                scrollerEl.scrollTop += AUTOSCROLL_PX_PER_SEC * dt;
            }
        }
        applyFade();
        raf = requestAnimationFrame(tick);
    }

    onMount(async () => {
        const res = await fetch(`${base}/story-data/beats.json`);
        beats = await res.json();
        loaded = true;
        raf = requestAnimationFrame(tick);
    });

    // React to a block being clicked in the horizontal timeline.
    $effect(() => {
        if (timelineFocus.source !== "horizontal" || timelineFocus.index === null) return;
        const row = rowEls[timelineFocus.index];
        if (!row) return;
        pauseTemporarily();
        row.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    onDestroy(() => {
        // onDestroy also fires during SSR teardown, where requestAnimationFrame
        // (and raf) never got set up by onMount — guard so that doesn't throw.
        if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(raf);
        clearTimeout(resumeTimer);
    });
</script>

<div class="viz-root anno-figure">
    <div class="box" bind:this={boxEl}>
        <div class="fade fade-top"></div>
        <div
            class="scroller"
            role="region"
            aria-label="Research activity timeline"
            bind:this={scrollerEl}
            onwheel={pauseTemporarily}
            ontouchstart={pauseTemporarily}
            onmousedown={pauseTemporarily}
        >
            <div class="timeline">
                {#if loaded && beats.length === 0}
                    <p class="empty">No beats in story-data/beats.json.</p>
                {/if}
                {#each beats as beat, i (beat.start + beat.source + i)}
                    <div class="row" use:collectRow={i}>
                        <div class="row-connector"><span class="row-dot" style="background:var(--series-{beat.source})"></span></div>
                        <div class="row-main">
                        <div class="row-time">{fmtTime(beat.start)}</div>
                        <div class="card">
                            <div class="card-header">
                                <span class="card-ic" style="color:var(--series-{beat.source})">
                                    <svg viewBox="0 0 28 28" aria-hidden="true"><path d={SOURCE_META[beat.source].icon} /></svg>
                                </span>
                                <span class="card-source">{SOURCE_META[beat.source].label}</span>
                                {#if byline(beat)}<span class="card-byline">{byline(beat)}</span>{/if}
                            </div>

                            {#if beat.source === "recording"}
                                <div class="detail-recording">
                                    <img src="{base}/story-data/{beat.content.segments[0].gif_path}" alt="Recording preview" />
                                </div>
                            {:else if beat.source === "slack"}
                                <div class="detail-slack">
                                    {#each beat.content.messages as m}
                                        <div class="slack-msg"><b>{m.sender}:</b> <span>{m.text}</span></div>
                                    {/each}
                                </div>
                            {:else if beat.source === "claude_code"}
                                <div class="card-detail">{claudeHead(beat)?.summary ?? beat.content.prompt ?? ""}</div>
                                {#if claudeChain(beat).length || beat.content.extra_steps_count}
                                    <div class="chain">
                                        {#each claudeChain(beat) as s}
                                            <div class="chain-step">
                                                <span class="chain-chip">{CHAIN_ICON[s.lane] ?? "•"} {s.lane.replace("_", " ")}</span>
                                                <span class="chain-text">{s.summary}</span>
                                            </div>
                                        {/each}
                                        {#if beat.content.extra_steps_count}
                                            <div class="chain-more">
                                                … {beat.content.extra_steps_count} more step{beat.content.extra_steps_count > 1 ? "s" : ""}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                                <div class="claude-diffstats">
                                    <span class="diff-add">+{beat.content.diff_stats.added}</span> / <span class="diff-remove">-{beat.content.diff_stats.removed}</span
                                    >
                                </div>
                            {:else if beat.source === "github"}
                                <div class="detail-github">
                                    {#if beat.content.commits}
                                        <div class="gh-commits">
                                            {#each beat.content.commits as c}
                                                <div class="gh-commit"><span class="gh-sha">{c.sha}</span> <span>{c.message}</span></div>
                                            {/each}
                                        </div>
                                    {:else if beat.content.action === "comment"}
                                        <div class="card-detail">{beat.content.body}</div>
                                    {:else}
                                        <div class="card-detail">{beat.content.title ?? beat.label}</div>
                                        {#if beat.content.diff_stats}
                                            <div class="claude-diffstats">
                                                <span class="diff-add">+{beat.content.diff_stats.added}</span> / <span class="diff-remove">-{beat.content.diff_stats.removed}</span
                                                >{#if beat.content.files_changed} <span class="gh-files">· {beat.content.files_changed} file{beat.content.files_changed > 1 ? "s" : ""} changed</span>{/if}
                                            </div>
                                        {/if}
                                        {#if beat.content.reviewers?.length}
                                            <div class="gh-reviewers">Reviewers: {beat.content.reviewers.join(", ")}</div>
                                        {/if}
                                        {#if beat.content.diff_snippet?.length}
                                            <div class="gh-files-list">
                                                {#each beat.content.diff_snippet as f}
                                                    <div class="gh-file">
                                                        <div class="gh-filename">{f.file}</div>
                                                        <div class="diff-lines">
                                                            {#each f.changes.slice(0, 12) as l}
                                                                <div class="diff-line {l.marker === '+' ? 'add' : l.marker === '-' ? 'remove' : 'context'}">{l.marker} {l.text}</div>
                                                            {/each}
                                                            {#if f.changes.length > 12}
                                                                <div class="gh-more">… {f.changes.length - 12} more line{f.changes.length - 12 > 1 ? "s" : ""}</div>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    {/if}
                                </div>
                            {:else}
                                <div class="detail-diff">
                                    <div class="diff-stats-row">
                                        <span class="diff-add">+{beat.content.added ?? 0}</span> / <span class="diff-remove">-{beat.content.removed ?? 0}</span>
                                    </div>
                                    {#if beat.content.diff?.length}
                                        <div class="diff-lines">
                                            {#each beat.content.diff.slice(0, 10) as l}
                                                <div class="diff-line {l.marker === '+' ? 'add' : 'remove'}">{l.marker} {l.text}</div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="fade fade-bottom"></div>
    </div>
</div>

<style>
    .viz-root {
        color-scheme: light;
        --surface-1: #f5f5f6;
        --surface-2: #ffffff;
        --text-primary: #1d1d1f;
        --text-secondary: #6e6e73;
        --text-muted: #8e8e93;
        --gridline: #e2e2e4;
        --border: #dcdcde;
        --status-good: #1a7f37;
        --status-critical: #d64541;

        width: 100%;
        height: 560px;
        color: var(--text-primary);
        font-family: var(--sans, "Segoe UI", "Helvetica Neue", Arial, sans-serif);
    }

    @media (prefers-color-scheme: dark) {
        :root:where(:not([data-theme="light"])) .viz-root {
            color-scheme: dark;
            --surface-1: #1c1c1e;
            --surface-2: #232326;
            --text-primary: #f5f5f7;
            --text-secondary: #ababaf;
            --text-muted: #8e8e93;
            --gridline: #3a3a3c;
            --border: #3a3a3c;
            --status-good: #37c76b;
            --status-critical: #e66767;
        }
    }
    :root[data-theme="dark"] .viz-root {
        color-scheme: dark;
        --surface-1: #1c1c1e;
        --surface-2: #232326;
        --text-primary: #f5f5f7;
        --text-secondary: #ababaf;
        --text-muted: #8e8e93;
        --gridline: #3a3a3c;
        --border: #3a3a3c;
        --status-good: #37c76b;
        --status-critical: #e66767;
    }

    .box {
        position: relative;
        flex: 1;
        min-height: 0;
        background: var(--surface-1);
        border: 1px solid var(--border);
        border-radius: 14px;
        box-shadow: 0 14px 40px rgba(43, 32, 24, 0.12);
        overflow: hidden;
    }
    .scroller {
        height: 100%;
        overflow-y: auto;
        padding: 28px 20px;
        scrollbar-width: thin;
    }
    .empty {
        color: var(--text-muted);
    }
    .fade {
        position: absolute;
        left: 0;
        right: 0;
        height: 56px;
        pointer-events: none;
        z-index: 2;
    }
    .fade-top {
        top: 0;
        background: linear-gradient(to bottom, var(--surface-1), transparent);
    }
    .fade-bottom {
        bottom: 0;
        background: linear-gradient(to top, var(--surface-1), transparent);
    }

    .timeline {
        position: relative;
    }
    .row {
        display: grid;
        grid-template-columns: 20px 1fr;
        column-gap: 0;
        transition: opacity 220ms ease;
    }
    .row-main {
        min-width: 0;
    }
    .row-time {
        padding: 0 0 4px 2px;
        font-size: 11px;
        color: var(--text-muted);
        text-align: left;
        white-space: nowrap;
    }
    .row-connector {
        position: relative;
        display: flex;
        justify-content: center;
    }
    .row-connector::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: -20px;
        width: 2px;
        background: var(--gridline);
    }
    .row:last-child .row-connector::before {
        display: none;
    }
    .row-dot {
        position: relative;
        z-index: 1;
        margin-top: 6px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border: 2px solid var(--surface-1);
    }

    .card {
        margin-bottom: 20px;
        border: 1px solid var(--gridline);
        border-radius: 10px;
        padding: 12px 14px;
        background: var(--surface-2);
    }
    .card-header {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
        margin-bottom: 8px;
    }
    .card-ic {
        display: inline-flex;
        flex: none;
    }
    .card-ic svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
    }
    .card-source {
        flex: none;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--text-primary);
        white-space: nowrap;
    }
    .card-byline {
        font-size: 11.5px;
        color: var(--text-secondary);
    }
    .card-detail {
        font-size: 12.5px;
        color: var(--text-primary);
    }

    .detail-recording img {
        display: block;
        max-width: 100%;
        border-radius: 7px;
        border: 1px solid var(--gridline);
    }

    .gh-commits {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .gh-commit {
        font-size: 12.5px;
        color: var(--text-primary);
        line-height: 1.4;
    }
    .gh-sha {
        font-family: ui-monospace, monospace;
        font-size: 11.5px;
        color: var(--text-secondary);
    }
    .gh-reviewers {
        margin-top: 6px;
        font-size: 11.5px;
        color: var(--text-secondary);
    }
    .gh-files {
        color: var(--text-secondary);
        font-weight: 400;
    }
    .gh-files-list {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .gh-file {
        border: 1px solid var(--gridline);
        border-radius: 7px;
        overflow: hidden;
    }
    .gh-filename {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        padding: 5px 8px;
        background: var(--surface-1);
        border-bottom: 1px solid var(--gridline);
    }
    .gh-file .diff-lines {
        padding: 4px 0;
    }
    .gh-more {
        padding: 2px 8px;
        font-size: 11px;
        color: var(--text-muted);
    }

    .detail-slack .slack-msg {
        font-size: 12.5px;
        line-height: 1.45;
        padding: 2px 0;
    }
    .detail-slack .slack-msg b {
        font-weight: 600;
        color: var(--text-primary);
    }
    .detail-slack .slack-msg span {
        color: var(--text-secondary);
    }

    .detail-diff .diff-stats-row {
        font-family: ui-monospace, monospace;
        font-size: 12.5px;
        margin-bottom: 6px;
    }
    .diff-add {
        color: var(--status-good);
        font-weight: 700;
    }
    .diff-remove {
        color: var(--status-critical);
        font-weight: 700;
    }
    .diff-lines {
        display: flex;
        flex-direction: column;
        gap: 1px;
        font-family: ui-monospace, monospace;
        font-size: 11.5px;
    }
    .diff-line {
        padding: 1px 6px;
        border-radius: 3px;
        white-space: pre-wrap;
    }
    .diff-line.add {
        background: color-mix(in oklab, var(--status-good) 14%, transparent);
        color: var(--status-good);
    }
    .diff-line.remove {
        background: color-mix(in oklab, var(--status-critical) 14%, transparent);
        color: var(--status-critical);
        text-decoration: line-through;
    }
    .diff-line.context {
        color: var(--text-muted);
    }

    .chain {
        margin-top: 8px;
        padding-left: 14px;
        border-left: 2px solid var(--gridline);
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .chain-step {
        display: flex;
        gap: 8px;
        font-size: 12.5px;
    }
    .chain-chip {
        flex: none;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 5px;
        background: var(--surface-1);
        border: 1px solid var(--gridline);
        color: var(--text-secondary);
        height: fit-content;
        white-space: nowrap;
    }
    .chain-text {
        color: var(--text-secondary);
    }
    .chain-more {
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 600;
    }
    .claude-diffstats {
        margin-top: 8px;
        font-size: 12.5px;
        font-family: ui-monospace, monospace;
    }
</style>
