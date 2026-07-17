<script lang="ts">
    // Interactive mock of the ParticipantApp (DataCollection) macOS app.
    // Everything shown is synthetic demo data — no real participant streams.

    const tabs = [
        "Overview",
        "Recording",
        "GitHub",
        "Drive",
        "Slack",
        "Overleaf",
        "Claude Code",
        "Settings",
    ];
    let tab = $state("Overview");
    let recordMode = $state<"screen" | "windows">("screen");
    let expanded = $state<Record<string, boolean>>({ "drive-0": true });
    let flash = $state("");
    let flashTimer: ReturnType<typeof setTimeout> | undefined;

    function toggle(id: string) {
        expanded[id] = !expanded[id];
    }
    function demoFlash(msg: string) {
        flash = msg;
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => (flash = ""), 2400);
    }

    // ---- Overview: activity heatmap (deterministic pseudo-random demo data) ----
    function mulberry32(a: number) {
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const HEAT_DAYS = 42; // six weeks, ending "today" (Jul 16, 2026)
    const heatStreams = [
        { name: "Drive", rgb: "52, 168, 83" },
        { name: "GitHub", rgb: "139, 92, 246" },
        { name: "Slack", rgb: "224, 30, 90" },
        { name: "Overleaf", rgb: "76, 154, 255" },
        { name: "Recording", rgb: "244, 132, 37" },
    ];
    const heat = heatStreams.map((s, si) => {
        const rnd = mulberry32(si * 31 + 7);
        return Array.from({ length: HEAT_DAYS }, () => {
            const v = rnd();
            return v < 0.42 ? 0 : v < 0.68 ? 1 : v < 0.9 ? 2 : 3;
        });
    });
    const heatMarks = ["Jun 4", "Jun 18", "Jul 2", "Jul 16"];

    const recent = [
        { rgb: "52, 168, 83", t: "analysis-plan edited", s: "Demo Participant · Jul 16 at 07:49 AM" },
        { rgb: "244, 132, 37", t: "Recorded 3 min (Entire Screen)", s: "Jul 16 at 06:24 AM" },
        { rgb: "224, 30, 90", t: "message in #demo-project", s: "Demo Advisor · Jul 16 at 02:00 AM" },
        { rgb: "139, 92, 246", t: "push to demo-research-pipeline", s: "demo-participant · Jul 15 at 04:12 PM" },
        { rgb: "76, 154, 255", t: "edited main.tex on Overleaf", s: "Demo Participant · Jul 15 at 11:24 AM" },
        { rgb: "52, 168, 83", t: "Notes — Weekly Check-In edited", s: "Demo Participant · Jul 14 at 09:53 PM" },
        { rgb: "244, 132, 37", t: "Recorded 47 min (2 windows)", s: "Jul 14 at 09:15 AM" },
        { rgb: "139, 92, 246", t: "opened PR #28: validation checks", s: "demo-participant · Jul 13 at 03:40 PM" },
    ];

    const connections = ["Drive", "GitHub", "Slack", "Overleaf"];

    // ---- Recording ----
    // July 2026 starts on a Wednesday.
    const calCells: (number | null)[] = [
        ...Array(3).fill(null),
        ...Array.from({ length: 31 }, (_, i) => i + 1),
        ...Array(1).fill(null),
    ];
    const calMarked = new Set([13, 14, 16, 17, 20]);
    const scheduled = [
        { d: "Jul 17, 7:45 AM", t: "SW: analysis sprint" },
        { d: "Jul 20, 9:15 AM", t: "SW: writing session" },
        { d: "Jul 24, 8:30 AM", t: "SW: experiment runs" },
    ];
    const sessions = [
        { d: "Jul 16, 6:24 AM", scope: "Entire Screen", dur: "2:41" },
        { d: "Jul 16, 6:20 AM", scope: "2 windows", dur: "0:03" },
        { d: "Jul 15, 11:24 AM", scope: "3 windows", dur: "0:04" },
        { d: "Jul 14, 9:15 AM", scope: "Entire Screen", dur: "47:12" },
    ];

    // ---- GitHub ----
    const ghFeed = [
        { t: "push to demo-research-pipeline", u: "demo-participant", time: "Jul 14 at 10:00 AM", d: "3 commits · add validation checks before scaling up the pipeline" },
        { t: "open PR #28: on-screen recording border", u: "demo-participant", time: "Jul 13 at 10:21 AM", d: "Adds a visible border while the screen is being recorded, so you always know." },
        { t: "push to feat/drive-tracking", u: "demo-participant", time: "Jul 11 at 11:29 AM", d: "2 commits · wire Drive revision feed into the overview heatmap" },
        { t: "open PR #27: calendar trigger", u: "demo-advisor", time: "Jul 10 at 11:13 AM", d: "Start a recording automatically when a scheduled work session begins." },
        { t: "push to main", u: "demo-advisor", time: "Jul 1 at 04:59 AM", d: "1 commit · pin dependencies for the sync service" },
    ];
    const ghIssues = [
        { n: 5, t: "recording engine" },
        { n: 6, t: "exclude certain windows" },
        { n: 7, t: "upload recordings to server" },
        { n: 8, t: "prompt user to share window" },
        { n: 10, t: "calendar recording trigger" },
        { n: 12, t: "launch recording at session start" },
    ];
    const ghBranches = [
        { name: "main", meta: "last commit on Jul 14, 2026" },
        { name: "feat/drive-tracking", meta: "last commit on Jul 11, 2026" },
        { name: "feat/calendar-trigger", meta: "last commit on Jul 10, 2026" },
        { name: "fix/upload-retries", meta: "last commit on Jul 1, 2026" },
    ];

    // ---- Drive ----
    const driveFeed = [
        {
            t: "analysis-plan was edited",
            time: "Jul 16, 2026 at 07:49 AM",
            who: "Demo Participant",
            diff: ["+ pilot results: two conditions look separable", "+ next: add validation checks before scaling", "+ draft methods while collection runs"],
        },
        { t: "analysis-plan was edited", time: "Jul 16, 2026 at 06:09 AM", who: "Demo Participant", diff: ["+ note: schedule reflection interview #1"] },
        { t: "Notes — Weekly Check-In was edited", time: "Jul 14, 2026 at 09:53 PM", who: "Demo Participant", diff: ["+ advisor: narrow to one hypothesis", "- explore all four conditions"] },
        { t: "Notes — Weekly Check-In was edited", time: "Jul 14, 2026 at 09:24 PM", who: "Demo Participant", diff: ["+ agenda for Friday sync"] },
    ];

    // ---- Slack ----
    const slackFeed = [
        { who: "Demo Advisor", ini: "DA", time: "Jul 16 at 02:00 AM", thread: false, msg: "Could you share the pilot numbers before our Friday sync?" },
        { who: "Demo Participant", ini: "DP", time: "Jul 14 at 11:34 PM", thread: false, msg: "Validation checks are in — noise rate dropped from 12% to 3%." },
        { who: "GitHub", ini: "G", time: "Jul 14 at 10:01 AM", thread: true, msg: "demo-participant pushed to demo-research-pipeline (3 commits)." },
        { who: "Demo Advisor", ini: "DA", time: "Jul 12 at 04:09 AM", thread: false, msg: "Nice — let's keep two conditions and drop the rest for the pilot." },
        { who: "GitHub", ini: "G", time: "Jul 10 at 11:14 AM", thread: true, msg: "demo-advisor opened PR #27: calendar recording trigger." },
    ];

    // ---- Overleaf ----
    const olFeed = [
        { t: "Demo Participant edited 1 file", time: "Jul 15 at 11:24 AM", d: "main.tex · +18 −4 lines (methods: data validation)" },
        { t: "Demo Participant edited 1 file", time: "Jun 27 at 11:20 PM", d: "related_work.tex · +32 −0 lines" },
        { t: "Demo Participant edited 6 files", time: "Jun 20 at 08:22 AM", d: "project skeleton imported from template" },
    ];

    // ---- Claude Code ----
    const ccBarsRnd = mulberry32(99);
    const ccBars = Array.from({ length: 28 }, (_, i) => (i % 7 >= 5 ? 0.1 : 0.15 + ccBarsRnd() * 0.85));
    const ccSessions = [
        { t: "Refactor the data pipeline", meta: "2026-07-11 · 2h 08m · 355 events" },
        { t: "Add validation checks + tests", meta: "2026-07-13 · 1h 41m · 257 events" },
        { t: "Debug the upload retries", meta: "2026-07-04 · 44m · 96 events" },
        { t: "Generate pilot figures", meta: "2026-06-30 · 1h 19m · 286 events" },
    ];
    const ccEvents = [
        { time: "13:55", chip: "ASSISTANT REPLY", cls: "reply", text: "Relaunched with the detailed upload logging enabled." },
        { time: "13:55", chip: "TOOL RESULT", cls: "result", text: "✓ Build succeeded" },
        { time: "13:55", chip: "TOOL CALL: BASH", cls: "call", text: "Ran: npm run build" },
        { time: "13:53", chip: "USER TEXT", cls: "user", text: "rerun it please — I need to deploy" },
        { time: "13:52", chip: "TOOL CALL: EDIT", cls: "call", text: "Edited pipeline/validate.py" },
        { time: "13:52", chip: "TOOL CALL: READ", cls: "call", text: "Read pipeline/validate.py" },
    ];

    // ---- Settings ----
    const settings = [
        { group: "GitHub", fields: ["Personal access token", "Repo (owner/name)"] },
        { group: "Slack", fields: ["Bot token (xoxb-…)", "Channel ID"] },
        { group: "Overleaf", fields: ["Project git URL", "Project token"] },
        { group: "Google Drive / Calendar", fields: ["Drive folder ID", "Calendar ID"] },
    ];
</script>

<div class="pa" role="group" aria-label="ParticipantApp interactive demo (synthetic data)">
    <div class="pa-titlebar">
        <span class="pa-lights"><i class="r"></i><i class="y"></i><i class="g"></i></span>
        <span class="pa-title">ParticipantApp</span>
        <span class="pa-demo-pill">Demo data</span>
    </div>

    <div class="pa-statusbar">
        <span class="pa-idle"><i></i>Idle</span>
        <span class="pa-status-right">
            {#if flash}<span class="pa-flash">{flash}</span>{/if}
            <span class="pa-user">demo-participant</span>
            <button class="pa-chip-btn" onclick={() => demoFlash("Demo mode — nothing to sync")}>Sync Now</button>
            <button class="pa-chip-btn" onclick={() => demoFlash("Demo mode — you're not logged in")}>Log Out</button>
        </span>
    </div>

    <div class="pa-body">
        <nav class="pa-side" aria-label="ParticipantApp sections">
            {#each tabs as t}
                <button class="pa-side-item" class:on={tab === t} onclick={() => (tab = t)}>{t}</button>
            {/each}
        </nav>

        <div class="pa-main">
            {#if tab === "Overview"}
                <div class="pa-card">
                    <div class="pa-card-h">Activity heatmap</div>
                    <div class="pa-heat">
                        {#each heatStreams as s, si}
                            <div class="pa-heat-row">
                                <span class="pa-heat-lbl">{s.name}</span>
                                <div class="pa-heat-cells">
                                    {#each heat[si] as lvl, di}
                                        <span
                                            class="pa-heat-cell"
                                            style={lvl === 0
                                                ? ""
                                                : `background: rgba(${s.rgb}, ${0.25 + lvl * 0.25})`}
                                            title="{s.name} · demo day {di + 1} · activity level {lvl}"
                                        ></span>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                        <div class="pa-heat-row">
                            <span class="pa-heat-lbl"></span>
                            <div class="pa-heat-marks">
                                {#each heatMarks as m}<span>{m}</span>{/each}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pa-cols">
                    <div class="pa-card">
                        <div class="pa-card-h">Recent activity (last 30 days)</div>
                        <ul class="pa-feed">
                            {#each recent as r}
                                <li>
                                    <span class="pa-dot" style="background: rgb({r.rgb})"></span>
                                    <span><b>{r.t}</b><small>{r.s}</small></span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                    <div class="pa-stack">
                        <div class="pa-card">
                            <div class="pa-card-h">Tool / source connections</div>
                            <ul class="pa-conn">
                                {#each connections as c}
                                    <li><span>{c}</span><span class="ok">● connected ↗</span></li>
                                {/each}
                            </ul>
                        </div>
                        <div class="pa-card">
                            <div class="pa-card-h">Upcoming recording</div>
                            <p class="pa-quiet">SW: analysis sprint — Jul 17, 7:45 AM (from Google Calendar)</p>
                        </div>
                    </div>
                </div>
            {:else if tab === "Recording"}
                <div class="pa-cols">
                    <div class="pa-card">
                        <div class="pa-card-h">Scheduled recording calendar <span class="pa-mini-btn">+ Add to Google Calendar</span></div>
                        <div class="pa-cal">
                            <div class="pa-cal-head">July 2026</div>
                            <div class="pa-cal-grid">
                                {#each ["S", "M", "T", "W", "T", "F", "S"] as d}<span class="pa-cal-dow">{d}</span>{/each}
                                {#each calCells as c}
                                    <span class="pa-cal-day" class:today={c === 16}>
                                        {c ?? ""}
                                        {#if c && calMarked.has(c)}<i></i>{/if}
                                    </span>
                                {/each}
                            </div>
                            <ul class="pa-sched">
                                {#each scheduled as s}
                                    <li><b>{s.d}</b><span>{s.t}</span></li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                    <div class="pa-stack">
                        <div class="pa-card">
                            <div class="pa-card-h">Recording config</div>
                            <div class="pa-seg">
                                <span>Record</span>
                                <button class:on={recordMode === "screen"} onclick={() => (recordMode = "screen")}>Entire Screen</button>
                                <button class:on={recordMode === "windows"} onclick={() => (recordMode = "windows")}>Specific Windows</button>
                            </div>
                            <p class="pa-quiet">
                                {recordMode === "screen"
                                    ? "The whole display is captured while a session is running."
                                    : "Only the windows you pick are captured — everything else stays private."}
                            </p>
                            <button class="pa-primary" onclick={() => demoFlash("Demo mode — recording is disabled")}>
                                Start Recording Now
                            </button>
                        </div>
                        <div class="pa-card">
                            <div class="pa-card-h">Recorded sessions</div>
                            <ul class="pa-sessions">
                                {#each sessions as s}
                                    <li><span><b>{s.d}</b><small>{s.scope}</small></span><span class="dur">{s.dur}</span></li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            {:else if tab === "GitHub"}
                <div class="pa-sync-row"><b>GitHub ↗</b><span>Last synced: Jul 14 at 09:08 AM · repo: demo-research-pipeline</span></div>
                <div class="pa-cols3">
                    <div class="pa-card">
                        <div class="pa-card-h">Activity feed</div>
                        <ul class="pa-feed">
                            {#each ghFeed as f, i}
                                <li>
                                    <span class="pa-dot" style="background: rgb(139, 92, 246)"></span>
                                    <span>
                                        <b>{f.t}</b><small>{f.u} · {f.time}</small>
                                        <button class="pa-expand" onclick={() => toggle(`gh-${i}`)}>
                                            {expanded[`gh-${i}`] ? "collapse" : "click to expand"}
                                        </button>
                                        {#if expanded[`gh-${i}`]}<em class="pa-detail">{f.d}</em>{/if}
                                    </span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                    <div class="pa-card">
                        <div class="pa-card-h">Open issues &amp; PRs</div>
                        <ul class="pa-issues">
                            {#each ghIssues as it}
                                <li><b>#{it.n}:</b> {it.t}<small>demo-participant · opened Jun 9, 2026</small></li>
                            {/each}
                        </ul>
                    </div>
                    <div class="pa-card">
                        <div class="pa-card-h">Branches</div>
                        <ul class="pa-issues">
                            {#each ghBranches as b}
                                <li><b class="mono">{b.name}</b><small>{b.meta}</small></li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {:else if tab === "Drive"}
                <div class="pa-sync-row"><b>Drive ↗</b><span>12 files · last synced: Jul 16 at 07:50 AM</span></div>
                <div class="pa-card">
                    <ul class="pa-feed pa-drive">
                        {#each driveFeed as f, i}
                            <li>
                                <span class="pa-doc">Doc</span>
                                <span>
                                    <b>{f.t}</b><small>{f.time} · {f.who}</small>
                                    <button class="pa-expand" onclick={() => toggle(`drive-${i}`)}>
                                        {expanded[`drive-${i}`] ? "collapse" : "click to expand"}
                                    </button>
                                    {#if expanded[`drive-${i}`]}
                                        <span class="pa-diff">
                                            {#each f.diff as line}
                                                <code class:add={line.startsWith("+")} class:del={line.startsWith("-")}>{line}</code>
                                            {/each}
                                        </span>
                                    {/if}
                                </span>
                            </li>
                        {/each}
                    </ul>
                </div>
            {:else if tab === "Slack"}
                <div class="pa-sync-row"><b>Slack ↗</b><span>#demo-project · last synced: Jul 16 at 02:00 AM</span></div>
                <div class="pa-card">
                    <ul class="pa-feed">
                        {#each slackFeed as m, i}
                            <li>
                                <span class="pa-ava">{m.ini}</span>
                                <span>
                                    <b>{m.who} sent a message {#if m.thread}<span class="pa-thread">thread</span>{/if}</b>
                                    <small>{m.time}</small>
                                    <button class="pa-expand" onclick={() => toggle(`sl-${i}`)}>
                                        {expanded[`sl-${i}`] ? "collapse" : "click to expand"}
                                    </button>
                                    {#if expanded[`sl-${i}`]}<em class="pa-detail">“{m.msg}”</em>{/if}
                                </span>
                            </li>
                        {/each}
                    </ul>
                </div>
            {:else if tab === "Overleaf"}
                <div class="pa-sync-row"><b>Overleaf ↗</b><span>demo-paper · last synced: Jul 15 at 11:49 PM</span></div>
                <div class="pa-card">
                    <ul class="pa-feed">
                        {#each olFeed as f, i}
                            <li>
                                <span class="pa-ava">DP</span>
                                <span>
                                    <b>{f.t}</b><small>{f.time}</small>
                                    <button class="pa-expand" onclick={() => toggle(`ol-${i}`)}>
                                        {expanded[`ol-${i}`] ? "collapse" : "click to expand"}
                                    </button>
                                    {#if expanded[`ol-${i}`]}<em class="pa-detail">{f.d}</em>{/if}
                                </span>
                            </li>
                        {/each}
                    </ul>
                </div>
            {:else if tab === "Claude Code"}
                <div class="pa-sync-row"><b>Claude Code</b><span>12 sessions, 3,412 events (demo)</span></div>
                <div class="pa-card">
                    <div class="pa-card-h">Session history</div>
                    <div class="pa-bars" aria-hidden="true">
                        {#each ccBars as h, i}
                            <span style="height: {Math.round(h * 100)}%" class:hl={i === 20}></span>
                        {/each}
                    </div>
                    <div class="pa-bars-axis"><span>06-18</span><span>06-27</span><span>07-06</span><span>07-15</span></div>
                </div>
                <div class="pa-cols">
                    <div class="pa-card">
                        <div class="pa-card-h">Sessions</div>
                        <ul class="pa-issues">
                            {#each ccSessions as s}
                                <li><b>{s.t}</b><small>{s.meta}</small></li>
                            {/each}
                        </ul>
                    </div>
                    <div class="pa-card">
                        <div class="pa-card-h">2026-07-13 · event stream</div>
                        <ul class="pa-events">
                            {#each ccEvents as e}
                                <li>
                                    <span class="t">{e.time}</span>
                                    <span class="pa-echip {e.cls}">{e.chip}</span>
                                    <span class="x">{e.text}</span>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {:else if tab === "Settings"}
                <div class="pa-card">
                    <div class="pa-card-h">Connections</div>
                    <p class="pa-quiet">Demo mode — all connections are simulated, and these fields are disabled.</p>
                    {#each settings as s}
                        <div class="pa-set-group">
                            <div class="pa-set-name">{s.group}</div>
                            {#each s.fields as f}
                                <label class="pa-set-row">
                                    <span>{f}</span>
                                    <input type="text" placeholder="•••••• (demo)" disabled />
                                </label>
                            {/each}
                            <button class="pa-chip-btn" disabled>Connect</button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* ===== macOS window chrome ===== */
    .pa {
        margin-top: 22px;
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
        background: #f5f5f6;
        box-shadow: 0 14px 40px rgba(43, 32, 24, 0.12);
        font-family: var(--sans);
        color: #1d1d1f;
    }

    .pa-titlebar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        background: #ececed;
        border-bottom: 1px solid #dcdcde;
    }

    .pa-lights {
        display: inline-flex;
        gap: 6px;
    }
    .pa-lights i {
        width: 11px;
        height: 11px;
        border-radius: 50%;
    }
    .pa-lights .r {
        background: #ff5f57;
    }
    .pa-lights .y {
        background: #febc2e;
    }
    .pa-lights .g {
        background: #28c840;
    }

    .pa-title {
        font-size: 13px;
        font-weight: 700;
        color: #3a3a3c;
    }

    .pa-demo-pill {
        margin-left: auto;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: #fff;
        background: var(--clay);
        border-radius: 999px;
        padding: 3px 10px;
    }

    .pa-statusbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 12px;
        background: #f2f2f3;
        border-bottom: 1px solid #e2e2e4;
        font-size: 11.5px;
        color: #6e6e73;
    }

    .pa-idle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .pa-idle i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c7c7cc;
    }

    .pa-status-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .pa-flash {
        color: var(--clay-deep);
        font-weight: 700;
    }

    .pa-user {
        color: #6e6e73;
    }

    .pa-chip-btn {
        border: 1px solid #d1d1d6;
        background: #fff;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 600;
        color: #3a3a3c;
        padding: 3px 10px;
    }
    .pa-chip-btn:disabled {
        opacity: 0.55;
        cursor: default;
    }

    /* ===== layout ===== */
    .pa-body {
        display: flex;
        min-height: 460px;
    }

    .pa-side {
        flex: none;
        width: 138px;
        background: #e8e8ea;
        border-right: 1px solid #dcdcde;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .pa-side-item {
        text-align: left;
        border: 0;
        background: none;
        border-radius: 7px;
        padding: 6px 10px;
        font-size: 12.5px;
        color: #3a3a3c;
    }
    .pa-side-item:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    .pa-side-item.on {
        background: #d64541;
        color: #fff;
        font-weight: 600;
    }

    .pa-main {
        flex: 1;
        min-width: 0;
        padding: 14px;
        background: #f5f5f6;
        max-height: 560px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .pa-card {
        background: #fff;
        border: 1px solid #e2e2e4;
        border-radius: 10px;
        padding: 12px 14px;
        min-width: 0;
    }

    .pa-card-h {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #6e6e73;
        margin-bottom: 10px;
    }

    .pa-cols {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 12px;
        align-items: start;
    }

    .pa-cols3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        align-items: start;
    }

    .pa-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
    }

    .pa-sync-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
        font-size: 13px;
    }
    .pa-sync-row b {
        color: #0a66c2;
        font-size: 14px;
    }
    .pa-sync-row span {
        color: #6e6e73;
        font-size: 11.5px;
    }

    .pa-quiet {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.5;
        color: #6e6e73;
        max-width: none;
    }

    /* ===== heatmap ===== */
    .pa-heat {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .pa-heat-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .pa-heat-lbl {
        flex: none;
        width: 62px;
        font-size: 10.5px;
        color: #6e6e73;
        text-align: right;
    }

    .pa-heat-cells {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(42, 1fr);
        gap: 3px;
        min-width: 0;
    }

    .pa-heat-cell {
        aspect-ratio: 1;
        border-radius: 2.5px;
        background: #ececed;
    }

    .pa-heat-marks {
        flex: 1;
        display: flex;
        justify-content: space-between;
        font-size: 9.5px;
        color: #aeaeb2;
    }

    /* ===== feeds ===== */
    .pa-feed {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .pa-feed li {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
        min-width: 0;
    }
    .pa-feed li:last-child {
        border-bottom: none;
    }
    .pa-feed li > span:last-child {
        min-width: 0;
    }

    .pa-feed b {
        display: block;
        font-weight: 600;
        color: #1d1d1f;
        line-height: 1.35;
    }
    .pa-feed small {
        display: block;
        color: #8e8e93;
        font-size: 11px;
        margin-top: 1px;
    }

    .pa-dot {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 5px;
    }

    .pa-ava {
        flex: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #d1d1d6;
        color: #3a3a3c;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pa-doc {
        flex: none;
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #0a66c2;
        border: 1px solid #b3d2ef;
        background: #eef5fc;
        border-radius: 5px;
        padding: 2px 6px;
        margin-top: 2px;
    }

    .pa-thread {
        display: inline-block;
        font-size: 9.5px;
        font-weight: 700;
        color: #2e6b46;
        background: #e3f2e8;
        border-radius: 5px;
        padding: 1px 6px;
        margin-left: 4px;
        vertical-align: 1px;
    }

    .pa-expand {
        border: 0;
        background: none;
        padding: 0;
        margin-top: 2px;
        font-size: 11px;
        font-weight: 600;
        color: #0a66c2;
        display: block;
    }

    .pa-detail {
        display: block;
        margin-top: 4px;
        font-style: normal;
        font-size: 12px;
        line-height: 1.45;
        color: #48484a;
        background: #f7f7f8;
        border: 1px solid #ececed;
        border-radius: 7px;
        padding: 7px 9px;
    }

    .pa-diff {
        display: flex;
        flex-direction: column;
        gap: 1px;
        margin-top: 5px;
    }
    .pa-diff code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        line-height: 1.5;
        padding: 1px 8px;
        border-radius: 3px;
        background: #f7f7f8;
        color: #48484a;
        white-space: pre-wrap;
    }
    .pa-diff code.add {
        background: #e6f4ea;
        color: #1e6b34;
    }
    .pa-diff code.del {
        background: #fdecea;
        color: #a3352b;
        text-decoration: line-through;
    }

    .pa-conn {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pa-conn li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
    }
    .pa-conn li:last-child {
        border-bottom: none;
    }
    .pa-conn .ok {
        color: #2e8b57;
        font-size: 11px;
        font-weight: 600;
    }

    .pa-issues {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pa-issues li {
        padding: 7px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
        line-height: 1.35;
    }
    .pa-issues li:last-child {
        border-bottom: none;
    }
    .pa-issues small {
        display: block;
        color: #8e8e93;
        font-size: 11px;
    }
    .pa-issues .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11.5px;
        color: #0a66c2;
    }

    /* ===== recording ===== */
    .pa-mini-btn {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: none;
        color: #3a3a3c;
        border: 1px solid #d1d1d6;
        border-radius: 6px;
        padding: 2px 8px;
        background: #fff;
    }

    .pa-cal-head {
        text-align: center;
        font-size: 12.5px;
        font-weight: 700;
        margin-bottom: 6px;
    }

    .pa-cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }

    .pa-cal-dow {
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        color: #aeaeb2;
        padding: 2px 0;
    }

    .pa-cal-day {
        position: relative;
        text-align: center;
        font-size: 11.5px;
        color: #3a3a3c;
        padding: 4px 0 8px;
        border-radius: 6px;
    }
    .pa-cal-day.today {
        background: #d64541;
        color: #fff;
        font-weight: 700;
    }
    .pa-cal-day i {
        position: absolute;
        left: 50%;
        bottom: 3px;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #d64541;
    }
    .pa-cal-day.today i {
        background: #fff;
    }

    .pa-sched {
        list-style: none;
        margin: 10px 0 0;
        padding: 8px 0 0;
        border-top: 1px solid #f0f0f1;
    }
    .pa-sched li {
        display: flex;
        gap: 10px;
        font-size: 11.5px;
        padding: 3px 0;
        color: #48484a;
    }
    .pa-sched b {
        font-weight: 600;
        color: #1d1d1f;
        flex: none;
    }

    .pa-seg {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #6e6e73;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }
    .pa-seg button {
        border: 1px solid #d1d1d6;
        background: #fff;
        border-radius: 7px;
        font-size: 11.5px;
        font-weight: 600;
        color: #3a3a3c;
        padding: 4px 10px;
    }
    .pa-seg button.on {
        background: #1d1d1f;
        border-color: #1d1d1f;
        color: #fff;
    }

    .pa-primary {
        margin-top: 10px;
        border: 1px solid #d64541;
        background: #d64541;
        color: #fff;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 700;
        padding: 7px 14px;
    }

    .pa-sessions {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pa-sessions li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
    }
    .pa-sessions li:last-child {
        border-bottom: none;
    }
    .pa-sessions b {
        display: block;
        font-weight: 600;
    }
    .pa-sessions small {
        display: block;
        color: #8e8e93;
        font-size: 11px;
    }
    .pa-sessions .dur {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11.5px;
        color: #6e6e73;
    }

    /* ===== claude code ===== */
    .pa-bars {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 88px;
    }
    .pa-bars span {
        flex: 1;
        border-radius: 3px 3px 0 0;
        background: #93bf8b;
        min-height: 3px;
    }
    .pa-bars span.hl {
        background: #4a7dbd;
    }

    .pa-bars-axis {
        display: flex;
        justify-content: space-between;
        font-size: 9.5px;
        color: #aeaeb2;
        margin-top: 4px;
    }

    .pa-events {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pa-events li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12px;
        min-width: 0;
    }
    .pa-events li:last-child {
        border-bottom: none;
    }
    .pa-events .t {
        flex: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10.5px;
        color: #aeaeb2;
    }
    .pa-events .x {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #48484a;
    }

    .pa-echip {
        flex: none;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.05em;
        border-radius: 5px;
        padding: 2px 7px;
        border: 1px solid transparent;
    }
    .pa-echip.result {
        background: #e3f2e8;
        color: #2e6b46;
        border-color: #bfdfca;
    }
    .pa-echip.call {
        background: #fff;
        color: #2e6b46;
        border-color: #bfdfca;
    }
    .pa-echip.user {
        background: #e8f1fb;
        color: #1d5a9e;
        border-color: #bcd6f0;
    }
    .pa-echip.reply {
        background: #f7f7f8;
        color: #6e6e73;
        border-color: #dcdcde;
    }

    /* ===== settings ===== */
    .pa-set-group {
        border-top: 1px solid #f0f0f1;
        padding: 10px 0;
    }
    .pa-set-name {
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 6px;
    }
    .pa-set-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 3px 0;
        font-size: 12px;
        color: #6e6e73;
    }
    .pa-set-row span {
        flex: none;
        width: 170px;
        text-align: right;
    }
    .pa-set-row input {
        flex: 1;
        border: 1px solid #d1d1d6;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 12px;
        background: #fafafa;
        min-width: 0;
    }
    .pa-set-group .pa-chip-btn {
        margin: 6px 0 0 180px;
    }

    /* ===== responsive ===== */
    @media (max-width: 860px) {
        .pa-cols,
        .pa-cols3 {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        .pa-body {
            flex-direction: column;
        }
        .pa-side {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
            border-right: none;
            border-bottom: 1px solid #dcdcde;
        }
        .pa-set-row {
            flex-direction: column;
            align-items: stretch;
        }
        .pa-set-row span {
            width: auto;
            text-align: left;
        }
        .pa-set-group .pa-chip-btn {
            margin-left: 0;
        }
    }
</style>
