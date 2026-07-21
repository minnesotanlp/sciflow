<script lang="ts">
    // Vertical auto-scrolling research-activity timeline. Ported from
    // scripts/story-export/preview/{index.html,app.js,style.css} in the
    // scholawrite-2 repo, where it was prototyped against a real (de-identified)
    // export before landing here. Reads only static/story-data/beats.json — a
    // pre-redacted, pre-clustered export; this component never talks to S3 or
    // any backend.
    import { onMount, onDestroy } from "svelte";
    import { base } from "$app/paths";

    type ChainStep = { lane: string; summary: string; editType?: string | null };

    type Beat = {
        source: "recording" | "claude_code" | "slack" | "google_drive" | "github" | "overleaf";
        start: string;
        end: string;
        duration_sec: number;
        actor?: string | null;
        target?: string | null;
        label: string;
        content: any;
    };

    // Same icon paths as the "Currently supported integrations" cards (streams
    // array in +page.svelte) — kept in sync by hand since the two don't share state.
    const SOURCE_META: Record<Beat["source"], { label: string; icon: string }> = {
        google_drive: { label: "Google Drive", icon: "M10 4h4l2 3h8v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Z" },
        slack: { label: "Slack", icon: "M8 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 5V6a2 2 0 0 1 2-2Z" },
        github: { label: "GitHub", icon: "M9 4a3 3 0 1 1-2 5.2V15a4 4 0 0 0 4 4h3.3a3 3 0 1 1 0 2H11a6 6 0 0 1-6-6V9.2A3 3 0 0 1 9 4Zm10 0a3 3 0 1 1-1 5.83V12h-2V9.83A3 3 0 0 1 19 4Z" },
        overleaf: { label: "Overleaf", icon: "M8 2h10l4 4v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 8h8v2h-8v-2Zm0 4h8v2h-8v-2Zm0 4h6v2h-6v-2Z" },
        claude_code: { label: "Claude Code", icon: "M4 5h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 5 4 3.5L7 17v-2.4l2.2-1.1L7 12.4V10Zm7 6h6v2h-6v-2Z" },
        recording: { label: "Recording", icon: "M4 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8v2h4v2H8v-2h4v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" },
    };

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
        for (const row of rowEls) {
            if (!row) continue;
            const r = row.getBoundingClientRect();
            const distTop = r.bottom - boxRect.top;
            const distBottom = boxRect.bottom - r.top;
            const nearest = Math.min(distTop, distBottom, FADE_ZONE_PX);
            row.style.opacity = String(Math.max(0, Math.min(1, nearest / FADE_ZONE_PX)));
        }
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

    onDestroy(() => {
        // onDestroy also fires during SSR teardown, where requestAnimationFrame
        // (and raf) never got set up by onMount — guard so that doesn't throw.
        if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(raf);
        clearTimeout(resumeTimer);
    });
</script>

<div class="viz-root">
    <div class="legend">
        {#each Object.entries(SOURCE_META) as [source, meta] (source)}
            <span class="legend-item">
                <span class="legend-ic" style="color:var(--series-{source})">
                    <svg viewBox="0 0 28 28" aria-hidden="true"><path d={meta.icon} /></svg>
                </span>
                {meta.label}
            </span>
        {/each}
    </div>

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
                        <div class="row-time">{fmtTime(beat.start)}</div>
                        <div class="row-connector"><span class="row-dot" style="background:var(--series-{beat.source})"></span></div>
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

        --series-google_drive: #34a853;
        --series-github: #8b5cf6;
        --series-slack: #e01e5a;
        --series-overleaf: #4c9aff;
        --series-recording: #f48425;
        --series-claude_code: #eab308;

        width: 100%;
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
            --series-google_drive: #34a853;
            --series-github: #8b5cf6;
            --series-slack: #e01e5a;
            --series-overleaf: #4c9aff;
            --series-recording: #f48425;
            --series-claude_code: #eab308;
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
        --series-google_drive: #34a853;
        --series-github: #8b5cf6;
        --series-slack: #e01e5a;
        --series-overleaf: #4c9aff;
        --series-recording: #f48425;
        --series-claude_code: #eab308;
    }

    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        padding-bottom: 12px;
        margin-bottom: 12px;
        font-size: 12px;
        color: var(--text-secondary);
    }
    .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }
    .legend-ic {
        display: inline-flex;
        flex: none;
    }
    .legend-ic svg {
        width: 13px;
        height: 13px;
        fill: currentColor;
    }

    .box {
        position: relative;
        height: 480px;
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
        grid-template-columns: 112px 20px 1fr;
        column-gap: 0;
        transition: opacity 220ms ease;
    }
    .row-time {
        padding-top: 4px;
        font-size: 11px;
        color: var(--text-muted);
        text-align: right;
        padding-right: 10px;
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
