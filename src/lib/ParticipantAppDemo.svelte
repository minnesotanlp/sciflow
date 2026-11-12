<script lang="ts">
    // Interactive mock of the SciFlowApp macOS app, modeled on
    // scholawrite-2/participant-app (ToolSelection, SettingsTabView, RecordingTabView,
    // RecordingPlaybackView). Everything shown is synthetic demo data — nothing is
    // captured, connected, or sent anywhere.
    import { base } from "$app/paths";

    // ---- Tool selection (mirrors SelectableTool: sidebar shows only picked tools) ----
    const TOOLS = [
        { key: "github", name: "GitHub", color: "#8b5cf6", mark: "GH" },
        { key: "drive", name: "Drive", color: "#34a853", mark: "D" },
        { key: "gmail", name: "Gmail", color: "#ea4335", mark: "M" },
        { key: "slack", name: "Slack", color: "#e01e5a", mark: "S" },
        { key: "telegram", name: "Telegram", color: "#2aabee", mark: "T" },
        { key: "overleaf", name: "Overleaf", color: "#4c9aff", mark: "O" },
        { key: "claudeCode", name: "Claude Code", color: "#d97757", mark: "✳" },
        { key: "codex", name: "Codex", color: "#3a3a3c", mark: ">_" },
    ];
    const CONNECTED = new Set(["github", "drive", "slack", "overleaf", "calendar"]);
    const BADGE_TOOLS = ["github", "drive", "slack", "telegram", "overleaf"];
    let selectedTools = $state<string[]>(["github", "drive", "slack", "overleaf", "claudeCode"]);

    function toggleTool(key: string) {
        if (selectedTools.includes(key)) {
            if (selectedTools.length === 1) {
                demoFlash("Keep at least one tool selected");
                return;
            }
            selectedTools = selectedTools.filter((k) => k !== key);
        } else {
            selectedTools = TOOLS.map((t) => t.key).filter((k) => k === key || selectedTools.includes(k));
        }
    }
    const tabs = $derived([
        "Overview",
        "Recording",
        ...TOOLS.filter((t) => selectedTools.includes(t.key)).map((t) => t.name),
        "Settings",
    ]);
    const toolByName = (name: string) => TOOLS.find((t) => t.name === name);

    let tab = $state("Overview");
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
    // Same project as the story timeline above (static/story-data/beats.json); the demo's
    // "today" is Mar 20, 2026 — right after the simulation finally matched the test.
    const HEAT_DAYS = 42; // six weeks, ending "today"
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
    const heatMarks = ["Feb 7", "Feb 21", "Mar 7", "Mar 20"];

    const recent = [
        { rgb: "224, 30, 90", t: "message in #drone-lattice", s: "Demo Advisor · Mar 19 at 06:52 PM" },
        { rgb: "244, 132, 37", t: "Recorded 1 h 30 min (2 windows)", s: "Mar 17 at 03:00 PM" },
        { rgb: "139, 92, 246", t: "push to lattice-damper", s: "demo-participant · Mar 13 at 08:00 PM" },
        { rgb: "52, 168, 83", t: "Pull-Test Results edited", s: "Demo Participant · Mar 10 at 04:05 PM" },
        { rgb: "76, 154, 255", t: "edited outline.tex on Overleaf", s: "Demo Participant · Mar 6 at 11:24 AM" },
        { rgb: "224, 30, 90", t: "message in #drone-lattice", s: "Demo Co-author · Mar 3 at 07:20 PM" },
        { rgb: "52, 168, 83", t: "Test Plan v2 edited", s: "Demo Participant · Feb 26 at 10:02 PM" },
        { rgb: "244, 132, 37", t: "Recorded 1 h 45 min (2 windows)", s: "Feb 18 at 03:00 PM" },
    ];

    const connections = ["Drive", "GitHub", "Slack", "Overleaf"];

    // ---- Recording ----
    // March 2026 starts on a Sunday.
    const calMonth = "March 2026";
    const calToday = 20;
    const calCells: (number | null)[] = [...Array.from({ length: 31 }, (_, i) => i + 1), ...Array(4).fill(null)];
    const calMarked = new Set([17, 24, 26, 31]);
    const scheduled = [
        { d: "Mar 24, 2:00 PM", t: "SW: re-run all three designs" },
        { d: "Mar 26, 10:00 AM", t: "SW: Figure 3 (predicted vs. measured)" },
        { d: "Mar 31, 3:00 PM", t: "SW: second shaker test" },
    ];
    // ---- Recording: screen (S) and keystroke (K) channels of one session ----
    type Channel = "screen" | "keys";
    type ChannelState = "idle" | "running" | "paused";
    const WINDOWS = [
        { id: "notebook", title: "Lab Notebook – Shaker Test — Google Docs" },
        { id: "rerun-simulation", title: "Simulation — lattice_arm_3mm" },
        { id: "test-vs-sim", title: "Plotting Tool — shaker_test_feb16.csv" },
        { id: "reading-papers", title: "lattice-damping-review.pdf — PDF Reader" },
        { id: "overleaf", title: "Paper Draft — Overleaf" },
        { id: "slack", title: "#drone-lattice — Slack" },
        { id: "messages", title: "Messages" },
    ];
    const DISPLAYS = ["Primary Display", "Built-in Retina Display", "External Display (27-inch)"];

    let chan = $state<Record<Channel, ChannelState>>({ screen: "idle", keys: "idle" });
    let elapsed = $state<Record<Channel, number>>({ screen: 0, keys: 0 });
    let sourceMode = $state<"screen" | "windows">("screen");
    let selectedWindows = $state<string[]>([]);
    let display = $state(DISPLAYS[0]);
    let lastSummary = $state("");

    // Forced "Select what to record" sheet — every start goes through it.
    let sheet = $state<null | { reconfigure: Channel[] | null; prev: Record<Channel, ChannelState> }>(null);
    let startWithScreen = $state(true);
    let startWithKeys = $state(false);

    const sessionActive = $derived(chan.screen !== "idle" || chan.keys !== "idle");
    const monitoringStatus = $derived.by(() => {
        const s = chan.screen === "running", k = chan.keys === "running";
        if (s && k) return "Recording + keystrokes";
        if (s) return "Recording";
        if (k) return "Keystrokes";
        return sessionActive ? "Paused" : "Idle";
    });
    const scopeLabel = $derived(
        sourceMode === "screen" ? "Entire Screen" : `${selectedWindows.length} window${selectedWindows.length === 1 ? "" : "s"}`,
    );

    $effect(() => {
        if (chan.screen !== "running" && chan.keys !== "running") return;
        const id = setInterval(() => {
            if (chan.screen === "running") elapsed.screen += 1;
            if (chan.keys === "running") elapsed.keys += 1;
        }, 1000);
        return () => clearInterval(id);
    });

    function openStartSheet(screen: boolean, keys: boolean) {
        startWithScreen = screen;
        startWithKeys = keys;
        if (!screen) sourceMode = "windows";
        sheet = { reconfigure: null, prev: { ...chan } };
    }
    function requestStart(c: Channel) {
        // Mid-session, the other channel just joins with the same selection.
        if (sessionActive) chan[c] = "running";
        else openStartSheet(c === "screen", c === "keys");
    }
    function requestReconfigure(cs: Channel[]) {
        const prev = { ...chan };
        for (const c of cs) chan[c] = "paused";
        sheet = { reconfigure: cs, prev };
    }
    function toggleWindow(id: string) {
        selectedWindows = selectedWindows.includes(id) ? selectedWindows.filter((w) => w !== id) : [...selectedWindows, id];
    }
    const canConfirm = $derived(
        !(sourceMode === "windows" && selectedWindows.length === 0) && (sessionActive || startWithScreen || startWithKeys),
    );
    function cancelSheet() {
        if (sheet?.reconfigure) chan = sheet.prev;
        sheet = null;
    }
    function confirmSheet() {
        if (!sheet || !canConfirm) return;
        if (sheet.reconfigure) {
            for (const c of sheet.reconfigure) chan[c] = "running";
        } else {
            elapsed = { screen: 0, keys: 0 };
            chan = { screen: startWithScreen ? "running" : "idle", keys: startWithKeys ? "running" : "idle" };
        }
        sheet = null;
    }
    let usedKeys = false;
    $effect(() => {
        if (chan.keys !== "idle") usedKeys = true;
    });
    function stopChannel(c: Channel) {
        const wasActive = sessionActive;
        chan[c] = "idle";
        if (wasActive && !sessionActive) finishSession();
    }
    function stopAll() {
        chan = { screen: "idle", keys: "idle" };
        finishSession();
    }
    function finishSession() {
        const secs = Math.max(elapsed.screen, elapsed.keys);
        const now = new Date();
        sessions = [
            {
                id: `demo-${now.getTime()}`,
                date: `Mar ${calToday}, ${now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`,
                source: scopeLabel,
                event: null,
                dur: fmtDur(secs),
                keystrokes: usedKeys,
                segments: [],
                entries: [],
                demo: true,
            },
            ...sessions,
        ];
        lastSummary = `${fmtDur(secs)} · ${scopeLabel} (demo — nothing was captured)`;
        usedKeys = false;
    }
    function fmtDur(secs: number) {
        const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
        return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
    }

    // ---- Recorded sessions + playback (segments, synced keystroke panel) ----
    type KeyEntry = { seg: number; t: number; kind: "typed" | "click" | "scroll"; text: string };
    type Segment = { src: string; startSec: number };
    type Session = {
        id: string; date: string; source: string; event: string | null; dur: string;
        keystrokes: boolean; segments: Segment[]; entries: KeyEntry[]; demo?: boolean;
    };
    const clip = (name: string) => `${base}/app-demo/recordings/${name}.mp4`;
    const at = (h: number, m: number) => h * 3600 + m * 60;
    let sessions = $state<Session[]>([
        {
            id: "rec-2026-03-17-1500", date: "Mar 17, 3:00 PM", source: "2 windows", event: "Re-run simulation",
            dur: "1:30:12", keystrokes: true,
            segments: [{ src: clip("rerun-simulation"), startSec: at(15, 0) }, { src: clip("test-vs-sim"), startSec: at(15, 5) }],
            entries: [
                { seg: 0, t: 1.4, kind: "click", text: "Left click" },
                { seg: 0, t: 2.3, kind: "typed", text: "2.6 GPa (measured)" },
                { seg: 0, t: 3.9, kind: "click", text: "Left click" },
                { seg: 1, t: 5.4, kind: "click", text: "Left click" },
                { seg: 1, t: 6.6, kind: "click", text: "Left click" },
                { seg: 1, t: 7.6, kind: "scroll", text: "Scrolled" },
            ],
        },
        {
            id: "rec-2026-02-18-1500", date: "Feb 18, 3:00 PM", source: "2 windows", event: "Comparing test vs. simulation",
            dur: "1:45:03", keystrokes: false,
            segments: [{ src: clip("test-vs-sim"), startSec: at(15, 0) }],
            entries: [],
        },
        {
            id: "rec-2026-01-20-1400", date: "Jan 20, 2:00 PM", source: "Entire Screen", event: "Reading papers",
            dur: "2:10:40", keystrokes: true,
            segments: [{ src: clip("reading-papers"), startSec: at(14, 0) }],
            entries: [
                { seg: 0, t: 0.6, kind: "scroll", text: "Scrolled" },
                { seg: 0, t: 4.2, kind: "click", text: "Left click" },
                { seg: 0, t: 6.0, kind: "typed", text: "• Lattices damp vibration well in simulation⟨Enter⟩" },
                { seg: 0, t: 7.6, kind: "typed", text: "• Few tested on real drones⟨Enter⟩" },
                { seg: 0, t: 8.7, kind: "typed", text: "• Check: is printed plastic as stiff as the datasheet says?" },
            ],
        },
    ]);

    let playing = $state<Session | null>(null);
    let segIdx = $state(0);
    let currentTime = $state(0);
    let enlarged = $state(false);
    let videoEl: HTMLVideoElement | undefined = $state();
    let keyPanel: HTMLDivElement | undefined = $state();
    let pendingSeek: number | null = null;

    function openSession(s: Session) {
        playing = s;
        segIdx = 0;
        currentTime = 0;
        enlarged = false;
    }
    function playSegment(i: number, t = 0) {
        if (i === segIdx && videoEl) {
            videoEl.currentTime = t;
            videoEl.play().catch(() => {});
        } else {
            pendingSeek = t;
            segIdx = i;
        }
    }
    function onLoaded() {
        if (videoEl && pendingSeek !== null) videoEl.currentTime = pendingSeek;
        pendingSeek = null;
    }
    function onEnded() {
        if (playing && segIdx < playing.segments.length - 1) playSegment(segIdx + 1);
    }
    const currentEntry = $derived.by(() => {
        if (!playing?.segments.length) return -1;
        let idx = -1;
        playing.entries.forEach((e, i) => {
            if (e.seg < segIdx || (e.seg === segIdx && e.t <= currentTime)) idx = i;
        });
        return idx;
    });
    $effect(() => {
        const i = currentEntry;
        if (i < 0 || !keyPanel) return;
        const row = keyPanel.querySelector<HTMLElement>(`[data-entry="${i}"]`);
        if (row) keyPanel.scrollTop = row.offsetTop - keyPanel.clientHeight / 2;
    });
    function fmtClock(sec: number) {
        const h = Math.floor(sec / 3600) % 24, m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
        return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    }
    const KEY_ICON = { typed: "✎", click: "◉", scroll: "↕" };

    // ---- Deletion requests: a reviewed request, never an instant delete ----
    type DeletionRequest = { id: number; sessionId: string; seg: number | null; reason: string };
    let deletionRequests = $state<DeletionRequest[]>([]);
    let deleteDialog = $state<null | { seg: number | null; reason: string }>(null);
    let nextRequestId = 1;
    const pendingFor = (sessionId: string, seg: number | null) =>
        deletionRequests.find((r) => r.sessionId === sessionId && r.seg === seg);
    function submitDeletion() {
        if (!playing || !deleteDialog) return;
        deletionRequests = [...deletionRequests, { id: nextRequestId++, sessionId: playing.id, seg: deleteDialog.seg, reason: deleteDialog.reason.trim() }];
        deleteDialog = null;
        demoFlash("Request sent — the research team will review it");
    }
    function cancelRequest(r: DeletionRequest) {
        deletionRequests = deletionRequests.filter((x) => x.id !== r.id);
    }
    const sessionById = (id: string) => sessions.find((s) => s.id === id);

    function selectTab(t: string) {
        tab = t;
        playing = null;
    }

    // ---- GitHub ----
    const ghRepo = "lattice-damper";
    const ghFeed = [
        { t: "push to main", u: "demo-participant", time: "Mar 13 at 08:00 PM", d: "2 commits · calculate stiffness from pull-test data; use measured stiffness in the simulation" },
        { t: "open PR #6: use measured stiffness", u: "demo-participant", time: "Mar 12 at 05:40 PM", d: "Replaces the 3.5 GPa datasheet value with the pull-test measurements (2.6 GPa along the layers, 1.9 GPa across)." },
        { t: "push to feat/pull-test-analysis", u: "demo-participant", time: "Mar 10 at 04:30 PM", d: "1 commit · read pull-test spreadsheet and fit stiffness per bar" },
        { t: "open issue #4: simulation 30% off from shaker test", u: "demo-participant", time: "Feb 17 at 05:05 PM", d: "Predicted first resonance 236 Hz, measured 164 Hz. Mounting rechecked; not the cause." },
        { t: "push to main", u: "demo-participant", time: "Jan 31 at 08:00 PM", d: "2 commits · add simulation sweep over lattice cell size; export predicted frequencies to a table" },
    ];
    const ghIssues = [
        { n: 4, t: "simulation 30% off from shaker test", d: "demo-participant · opened Feb 17, 2026" },
        { n: 7, t: "re-run all three cell sizes with measured stiffness", d: "demo-participant · opened Mar 19, 2026" },
        { n: 8, t: "predicted-vs-measured chart (Figure 3)", d: "demo-advisor · opened Mar 19, 2026" },
        { n: 9, t: "add error bars from the 10 pull tests", d: "demo-coauthor · opened Mar 20, 2026" },
    ];
    const ghBranches = [
        { name: "main", meta: "last commit on Mar 13, 2026" },
        { name: "feat/pull-test-analysis", meta: "last commit on Mar 11, 2026" },
        { name: "feat/cell-size-sweep", meta: "last commit on Jan 31, 2026" },
    ];

    // ---- Drive ----
    const driveFeed = [
        {
            t: "Pull-Test Results was edited",
            time: "Mar 10, 2026 at 04:05 PM",
            who: "Demo Participant",
            diff: ["+ Along the layers: 2.6 GPa average (5 bars)", "+ Across the layers: 1.9 GPa average (5 bars)", "+ Datasheet says 3.5 GPa — explains most of the 30% gap"],
        },
        {
            t: "Test Plan v2 was edited",
            time: "Feb 26, 2026 at 10:02 PM",
            who: "Demo Participant",
            diff: ["- Material stiffness: 3.5 GPa (from the datasheet)", "+ Material stiffness: measure it with pull tests on printed bars", "- Next: print the final design", "+ Next: re-run the simulation with the measured stiffness"],
        },
        {
            t: "Lab Notebook – Shaker Test was edited",
            time: "Feb 16, 2026 at 09:00 PM",
            who: "Demo Participant",
            diff: ["+ Measured first resonance: 164 Hz. Simulation predicted 236 Hz.", "+ That's 30% off. Rechecked the mounting; that isn't the cause."],
        },
        {
            t: "Lab Notebook was edited",
            time: "Jan 19, 2026 at 10:00 PM",
            who: "Demo Participant",
            diff: ["+ Drone arm vibrates at ~180 Hz while hovering. Camera footage is blurry.", "+ Idea: fill the arm with a 3D-printed lattice to absorb the vibration."],
        },
    ];

    // ---- Slack ----
    const slackChannel = "#drone-lattice";
    const slackFeed = [
        { who: "Demo Advisor", ini: "DA", time: "Mar 19 at 06:52 PM", thread: false, msg: "That correction is the real contribution. Others simulating printed parts have the same problem. Make that the paper." },
        { who: "Demo Participant", ini: "DP", time: "Mar 19 at 06:45 PM", thread: false, msg: "New simulation: 169 Hz. Test: 164 Hz. Within 3%!" },
        { who: "GitHub", ini: "G", time: "Mar 13 at 08:01 PM", thread: true, msg: "demo-participant pushed to lattice-damper (2 commits)." },
        { who: "Demo Co-author", ini: "DC", time: "Mar 3 at 07:20 PM", thread: false, msg: "Print bars in two directions. Printed parts are usually stiffer along the layers than across them." },
        { who: "Demo Advisor", ini: "DA", time: "Feb 17 at 05:42 PM", thread: false, msg: "It may not be a bug. Printed plastic is often softer than the datasheet says. Measure it yourself." },
        { who: "Demo Participant", ini: "DP", time: "Feb 17 at 05:10 PM", thread: false, msg: "Test shows 164 Hz, simulation said 236 Hz. 30% off and I can't find the bug." },
    ];

    // ---- Overleaf ----
    const olProject = "lattice-paper";
    const olFeed = [
        { t: "Demo Participant edited 1 file", time: "Mar 6 at 11:24 AM", d: "outline.tex · +24 −0 lines (paper outline: design, shaker test, simulation)" },
        { t: "Demo Participant edited 1 file", time: "Feb 2 at 09:15 PM", d: "related_work.tex · +31 −0 lines (lattice damping literature)" },
        { t: "Demo Participant edited 6 files", time: "Jan 15 at 02:40 PM", d: "project created from the journal template" },
    ];

    // ---- Claude Code ----
    const ccBarsRnd = mulberry32(99);
    const ccBars = Array.from({ length: 28 }, (_, i) => (i % 7 >= 5 ? 0.1 : 0.15 + ccBarsRnd() * 0.85));
    const ccSessions = [
        { t: "Analyze pull-test data", meta: "2026-03-10 · 1h 52m · 214 events" },
        { t: "Plot measured vs. simulated spectrum", meta: "2026-02-18 · 47m · 88 events" },
        { t: "Debug: simulation vs. shaker test mismatch", meta: "2026-02-17 · 1h 05m · 132 events" },
        { t: "Set up simulation sweep over cell size", meta: "2026-01-28 · 2h 31m · 301 events" },
    ];
    const ccEvents = [
        { time: "15:52", chip: "ASSISTANT REPLY", cls: "reply", text: "Along the layers: 2.6 GPa average. Across: 1.9 GPa. Both well below the 3.5 GPa datasheet value." },
        { time: "15:51", chip: "TOOL RESULT", cls: "result", text: "✓ Wrote results/stiffness_by_direction.csv" },
        { time: "15:51", chip: "TOOL CALL: BASH", cls: "call", text: "Ran: python analysis/stiffness.py data/pull_tests.csv" },
        { time: "15:49", chip: "TOOL CALL: EDIT", cls: "call", text: "Edited analysis/stiffness.py" },
        { time: "15:48", chip: "TOOL CALL: READ", cls: "call", text: "Read data/pull_tests.csv" },
        { time: "15:47", chip: "USER TEXT", cls: "user", text: "help me calculate each bar's stiffness and compare the two print directions" },
    ];

    // ---- Settings: connection sections (same order as SettingsTabView) ----
    const settings = [
        { group: "GitHub", key: "github", fields: ["Personal access token", "Repo (owner/name)"], button: "Connect" },
        { group: "Slack", key: "slack", fields: ["Bot token (xoxb-…)", "Channel ID"], button: "Connect" },
        { group: "Telegram", key: "telegram", fields: ["Bot token (from @BotFather)", "Chat ID"], button: "Connect" },
        { group: "Overleaf", key: "overleaf", fields: ["Project git URL", "Project token"], button: "Connect" },
        { group: "Google Drive", key: "drive", fields: ["Drive folder ID"], button: "Sign in with Google" },
        { group: "Google Calendar", key: "calendar", fields: ["Calendar ID"], button: "Sign in with Google" },
        { group: "Gmail", key: "gmail", fields: [], button: "Sign in with Google", note: "Read-only access. Nothing is collected until you choose emails and upload them in the Gmail tab." },
    ];
</script>

<div class="pa" role="group" aria-label="SciFlowApp interactive demo (synthetic data)">
    <div class="pa-titlebar">
        <span class="pa-lights"><i class="r"></i><i class="y"></i><i class="g"></i></span>
        <span class="pa-title">SciFlowApp</span>
        <span class="pa-demo-pill">Demo data</span>
    </div>

    <div class="pa-statusbar">
        <span class="pa-idle">
            <span class="pa-badge" class:on={chan.screen === "running"} class:paused={chan.screen === "paused"} title="Screen recording">S</span>
            <span class="pa-badge" class:on={chan.keys === "running"} class:paused={chan.keys === "paused"} title="Keystroke logging">K</span>
            {monitoringStatus}
        </span>
        <span class="pa-status-right">
            {#if flash}<span class="pa-flash">{flash}</span>{/if}
            <span class="pa-tool-badges">
                {#each TOOLS.filter((t) => BADGE_TOOLS.includes(t.key) && selectedTools.includes(t.key)) as t (t.key)}
                    <span
                        class="pa-tool-badge"
                        class:off={!CONNECTED.has(t.key)}
                        style="--c: {t.color}"
                        title="{t.name} — {CONNECTED.has(t.key) ? 'connected' : 'not connected'}"
                    >{t.mark}<i></i></span>
                {/each}
            </span>
            <span class="pa-user">demo-participant</span>
            <button class="pa-chip-btn" onclick={() => demoFlash("Demo mode — nothing to sync")}>Sync Now</button>
            <button class="pa-chip-btn" onclick={() => demoFlash("Demo mode — you're not logged in")}>Log Out</button>
        </span>
    </div>

    <div class="pa-body">
        <nav class="pa-side" aria-label="SciFlowApp sections">
            {#each tabs as t (t)}
                <button class="pa-side-item" class:on={tab === t} onclick={() => selectTab(t)}>{t}</button>
            {/each}
        </nav>

        <div class="pa-main">
            {#if playing}
                {@const p = playing}
                {@const sessionReq = pendingFor(p.id, null)}
                <div class="pa-pb-head">
                    <button class="pa-back" onclick={() => (playing = null)}>‹ Back to Recordings</button>
                    <span class="pa-pb-id"><code>{p.id}</code>{#if p.event}<small>{p.event}</small>{/if}</span>
                    {#if sessionReq}
                        <span class="pa-pending">◷ Deletion requested <button class="pa-link" onclick={() => cancelRequest(sessionReq)}>Cancel</button></span>
                    {:else}
                        <button class="pa-chip-btn danger" onclick={() => (deleteDialog = { seg: null, reason: "" })}>🗑 Request Deletion of Entire Recording</button>
                    {/if}
                </div>

                {#if !p.segments.length}
                    <div class="pa-card pa-empty">
                        <b>Demo recording — nothing was captured from your screen.</b>
                        <span>In the real app, this session's video segments{p.keystrokes ? " and keystrokes" : ""} would play here.</span>
                    </div>
                {:else}
                    <div class="pa-pb" class:enlarged>
                        {#if p.segments.length > 1 && !enlarged}
                            <div class="pa-seglist">
                                <div class="pa-mini-h">Segments</div>
                                {#each p.segments as s, i}
                                    {@const segReq = pendingFor(p.id, i)}
                                    <div class="pa-seg-row" class:on={i === segIdx}>
                                        <button class="pa-seg-main" onclick={() => playSegment(i)}>
                                            <b>Segment {i + 1}</b><small>{fmtClock(s.startSec)} · 5m 0s</small>
                                        </button>
                                        {#if segReq}
                                            <button class="pa-link warn" onclick={() => cancelRequest(segReq)}>Cancel</button>
                                        {:else}
                                            <button class="pa-trash" title="Request deletion of this segment" onclick={() => (deleteDialog = { seg: i, reason: "" })}>🗑</button>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <div class="pa-player">
                            <!-- svelte-ignore a11y_media_has_caption -->
                            <video
                                bind:this={videoEl}
                                bind:currentTime
                                src={p.segments[segIdx].src}
                                controls
                                autoplay
                                muted
                                playsinline
                                onloadedmetadata={onLoaded}
                                onended={onEnded}
                            ></video>
                            <div class="pa-player-bar">
                                <span>Now playing: segment {segIdx + 1} of {p.segments.length} · <i>demo clips are shortened to ~10 s</i></span>
                                <button class="pa-link" onclick={() => (enlarged = !enlarged)}>{enlarged ? "⤡ Show Keystrokes" : "⤢ Enlarge Video"}</button>
                            </div>
                        </div>

                        {#if !enlarged}
                            <div class="pa-keys">
                                <div class="pa-mini-h">Keystrokes</div>
                                {#if !p.entries.length}
                                    <p class="pa-quiet">No keystrokes were logged in this session.</p>
                                {:else}
                                    <div class="pa-keys-list" bind:this={keyPanel}>
                                        {#each p.entries as e, i}
                                            <button class="pa-key-row" class:on={i === currentEntry} data-entry={i} onclick={() => playSegment(e.seg, e.t)}>
                                                <span class="t">{fmtClock(p.segments[e.seg].startSec + e.t)}</span>
                                                <span class="ic">{KEY_ICON[e.kind]}</span>
                                                <span class="x" class:mono={e.kind === "typed"}>{e.text}</span>
                                            </button>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            {:else if tab === "Overview"}
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
                            <p class="pa-quiet">SW: re-run all three designs — Mar 24, 2:00 PM (from Google Calendar)</p>
                        </div>
                    </div>
                </div>
            {:else if tab === "Recording"}
                <div class="pa-cols">
                    <div class="pa-card">
                        <div class="pa-card-h">Scheduled recording calendar <span class="pa-mini-btn">+ Add to Google Calendar</span></div>
                        <div class="pa-cal">
                            <div class="pa-cal-head">{calMonth}</div>
                            <div class="pa-cal-grid">
                                {#each ["S", "M", "T", "W", "T", "F", "S"] as d}<span class="pa-cal-dow">{d}</span>{/each}
                                {#each calCells as c}
                                    <span class="pa-cal-day" class:today={c === calToday}>
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
                            {#if sessionActive}
                                <p class="pa-quiet pa-scope">Scope: {scopeLabel}</p>
                            {/if}
                            {#each [["screen", "S", "Screen recording"], ["keys", "K", "Keystroke logging"]] as [c, letter, title] (c)}
                                {@const ch = c as Channel}
                                {@const st = chan[ch]}
                                <div class="pa-chan">
                                    <span class="pa-badge lg" class:on={st === "running"} class:paused={st === "paused"}>{letter}</span>
                                    <span class="pa-chan-t">
                                        {title}{#if st !== "idle"}<small class="mono">{st === "paused" ? "paused · " : ""}{fmtDur(elapsed[ch])}</small>{/if}
                                    </span>
                                    {#if st === "idle"}
                                        <button class="pa-chip-btn" disabled={!!sheet} onclick={() => requestStart(ch)}>Start</button>
                                    {:else}
                                        <button class="pa-chip-btn" disabled={!!sheet} onclick={() => requestReconfigure([ch])}>Reconfigure</button>
                                        {#if st === "paused"}
                                            <button class="pa-chip-btn" onclick={() => (chan[ch] = "running")}>Resume</button>
                                        {:else}
                                            <button class="pa-chip-btn" onclick={() => (chan[ch] = "paused")}>Pause</button>
                                        {/if}
                                        <button class="pa-chip-btn" onclick={() => stopChannel(ch)}>Stop</button>
                                    {/if}
                                </div>
                            {/each}
                            {#if !sessionActive}
                                <div class="pa-chan-both"><button class="pa-chip-btn" disabled={!!sheet} onclick={() => openStartSheet(true, true)}>Start Both</button></div>
                            {:else if chan.screen !== "idle" && chan.keys !== "idle"}
                                <div class="pa-chan-both">
                                    <button class="pa-chip-btn" disabled={!!sheet} onclick={() => requestReconfigure(["screen", "keys"])}>Reconfigure Both</button>
                                    {#if chan.screen === "running" || chan.keys === "running"}
                                        <button class="pa-chip-btn" onclick={() => (chan = { screen: "paused", keys: "paused" })}>Pause Both</button>
                                    {/if}
                                    <button class="pa-chip-btn" onclick={stopAll}>Stop Both</button>
                                </div>
                            {/if}
                            {#if lastSummary}<p class="pa-quiet pa-scope">Last session: {lastSummary}</p>{/if}
                        </div>
                        <div class="pa-card">
                            <div class="pa-card-h">Recorded sessions</div>
                            <ul class="pa-sessions">
                                {#each sessions as s (s.id)}
                                    <li>
                                        <button class="pa-session" onclick={() => openSession(s)}>
                                            <span><b>{s.date}</b><small>{s.source}{s.event ? ` · ${s.event}` : ""}</small></span>
                                            <span class="dur">{s.dur} ›</span>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                        {#if deletionRequests.length}
                            <div class="pa-card">
                                <div class="pa-card-h">Deletion requests</div>
                                <ul class="pa-sessions">
                                    {#each deletionRequests as r (r.id)}
                                        {@const s = sessionById(r.sessionId)}
                                        <li class="pa-req">
                                            <button class="pa-session" onclick={() => s && openSession(s)}>
                                                <span>
                                                    <b>{r.seg === null ? "Whole session" : `Segment ${r.seg + 1}`} · {s?.date}</b>
                                                    {#if r.reason}<small>{r.reason}</small>{/if}
                                                </span>
                                                <span class="pa-pending">Pending</span>
                                            </button>
                                            <button class="pa-link" onclick={() => cancelRequest(r)}>Cancel</button>
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else if tab === "GitHub"}
                <div class="pa-sync-row"><b>GitHub ↗</b><span>Last synced: Mar 20 at 09:10 AM · repo: {ghRepo}</span></div>
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
                                <li><b>#{it.n}:</b> {it.t}<small>{it.d}</small></li>
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
                <div class="pa-sync-row"><b>Drive ↗</b><span>9 files · last synced: Mar 20 at 09:10 AM</span></div>
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
                <div class="pa-sync-row"><b>Slack ↗</b><span>{slackChannel} · last synced: Mar 19 at 06:55 PM</span></div>
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
                <div class="pa-sync-row"><b>Overleaf ↗</b><span>{olProject} · last synced: Mar 18 at 10:30 PM</span></div>
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
                <div class="pa-sync-row"><b>Claude Code</b><span>8 sessions, 1,946 events (demo)</span></div>
                <div class="pa-card">
                    <div class="pa-card-h">Session history</div>
                    <div class="pa-bars" aria-hidden="true">
                        {#each ccBars as h, i}
                            <span style="height: {Math.round(h * 100)}%" class:hl={i === 17}></span>
                        {/each}
                    </div>
                    <div class="pa-bars-axis"><span>02-21</span><span>03-02</span><span>03-11</span><span>03-20</span></div>
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
                        <div class="pa-card-h">2026-03-10 · event stream</div>
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
                    <div class="pa-set-name lg">Tools</div>
                    <p class="pa-quiet">Pick the tools you work with. Only these appear in the sidebar.</p>
                    <div class="pa-tiles">
                        {#each TOOLS as t (t.key)}
                            {@const on = selectedTools.includes(t.key)}
                            <button class="pa-tile" class:on aria-pressed={on} onclick={() => toggleTool(t.key)}>
                                <span class="pa-tile-check">{on ? "✓" : ""}</span>
                                <span class="pa-tile-ic" style="color: {t.color}">{t.mark}</span>
                                <span class="pa-tile-n">{t.name}</span>
                            </button>
                        {/each}
                    </div>
                </div>
                <div class="pa-card">
                    <div class="pa-card-h">Connections</div>
                    <p class="pa-quiet">Demo mode — fields are disabled, so no real tokens are ever entered here.</p>
                    {#each settings as s (s.key)}
                        <div class="pa-set-group">
                            <div class="pa-set-name">{s.group}</div>
                            {#each s.fields as f}
                                <label class="pa-set-row">
                                    <span>{f}</span>
                                    <input type="text" placeholder={CONNECTED.has(s.key) ? "•••••• (demo)" : ""} disabled />
                                </label>
                            {/each}
                            {#if s.note}<p class="pa-quiet pa-set-note">{s.note}</p>{/if}
                            <div class="pa-set-actions">
                                <button class="pa-chip-btn" disabled>{s.button}</button>
                                <button class="pa-chip-btn danger" disabled>Disconnect</button>
                                {#if CONNECTED.has(s.key)}
                                    <span class="pa-conn-ok">✓ Connected</span>
                                {:else}
                                    <span class="pa-conn-no">Not connected</span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                {@const t = toolByName(tab)}
                <div class="pa-card pa-empty">
                    <b>{t?.name} isn't connected in this demo.</b>
                    <span>In the real app, connect {t?.name} in Settings and its activity shows up here.</span>
                    <button class="pa-chip-btn" onclick={() => selectTab("Settings")}>Go to Settings</button>
                </div>
            {/if}
        </div>
    </div>

    {#if sheet}
        <div class="pa-overlay">
            <div class="pa-sheet" role="dialog" aria-modal="true" aria-label="Select what to record">
                <div class="pa-sheet-h">
                    <b>Select what to record</b>
                    <button class="pa-chip-btn" onclick={() => demoFlash("Window list refreshed (demo)")}>Refresh</button>
                </div>
                {#if !sessionActive}
                    <div class="pa-sheet-toggles">
                        <label><input type="checkbox" bind:checked={startWithScreen} onchange={() => { if (!startWithScreen) sourceMode = "windows"; }} /> Screen recording</label>
                        <label><input type="checkbox" bind:checked={startWithKeys} /> Keystroke logging</label>
                    </div>
                {/if}
                {#if sessionActive || startWithScreen}
                    <div class="pa-segmented">
                        <button class:on={sourceMode === "screen"} onclick={() => (sourceMode = "screen")}>Entire Screen</button>
                        <button class:on={sourceMode === "windows"} onclick={() => (sourceMode = "windows")}>Specific Windows</button>
                    </div>
                {:else}
                    <p class="pa-quiet">Keystrokes are logged only while one of the selected windows is focused.</p>
                {/if}

                <div class="pa-sheet-body">
                    {#if sourceMode === "screen"}
                        <label class="pa-display">
                            Display
                            <select bind:value={display}>
                                {#each DISPLAYS as d}<option>{d}</option>{/each}
                            </select>
                        </label>
                        <p class="pa-quiet">Everything on this display is captured while the session runs.</p>
                    {:else}
                        <p class="pa-quiet">Click the windows to record. Anything you don't select — like Messages — is never captured.</p>
                        <div class="pa-wgrid">
                            {#each WINDOWS as w (w.id)}
                                {@const on = selectedWindows.includes(w.id)}
                                <button class="pa-win" class:on aria-pressed={on} onclick={() => toggleWindow(w.id)}>
                                    <span class="pa-win-thumb">
                                        <img src="{base}/app-demo/windows/{w.id}.jpg" alt="" loading="lazy" />
                                        {#if on}<span class="pa-win-check">✓</span>{/if}
                                    </span>
                                    <span class="pa-win-t">{w.title}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="pa-sheet-foot">
                    {#if sourceMode === "windows"}<span class="pa-quiet">{selectedWindows.length} selected</span>{/if}
                    <button class="pa-chip-btn" onclick={cancelSheet}>Cancel</button>
                    <button class="pa-primary" disabled={!canConfirm} onclick={confirmSheet}>Confirm</button>
                </div>
            </div>
        </div>
    {/if}

    {#if deleteDialog}
        <div class="pa-overlay">
            <div class="pa-sheet pa-sheet-sm" role="dialog" aria-modal="true" aria-label="Request deletion">
                <b>Request deletion of {deleteDialog.seg === null ? "this recording" : "this segment"}?</b>
                <p class="pa-quiet">
                    This won't delete anything right away. Your reason goes to the research team's review queue; they review
                    the recording and reach out to resolve it.
                </p>
                <textarea bind:value={deleteDialog.reason} rows="3" placeholder="Reason (e.g. a private message was on screen)"></textarea>
                <div class="pa-sheet-foot">
                    <button class="pa-chip-btn" onclick={() => (deleteDialog = null)}>Cancel</button>
                    <button class="pa-primary" onclick={submitDeletion}>Send Request</button>
                </div>
            </div>
        </div>
    {/if}
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
    .pa-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        font-size: 9.5px;
        font-weight: 800;
        color: #8e8e93;
        background: #e2e2e4;
    }
    .pa-badge.lg {
        width: 20px;
        height: 20px;
        font-size: 11px;
        flex: none;
    }
    .pa-badge.on {
        color: #fff;
        background: #28a745;
    }
    .pa-badge.paused {
        color: #fff;
        background: #f0a020;
    }

    .pa-tool-badges {
        display: inline-flex;
        gap: 7px;
    }
    .pa-tool-badge {
        position: relative;
        font-size: 9.5px;
        font-weight: 800;
        color: var(--c);
    }
    .pa-tool-badge.off {
        opacity: 0.4;
    }
    .pa-tool-badge i {
        position: absolute;
        right: -4px;
        bottom: -1px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #28a745;
    }
    .pa-tool-badge.off i {
        background: #aeaeb2;
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

    .pa-segmented {
        display: flex;
        border: 1px solid #d1d1d6;
        border-radius: 7px;
        overflow: hidden;
        background: #fff;
    }
    .pa-segmented button {
        flex: 1;
        border: 0;
        background: none;
        font-size: 12px;
        font-weight: 600;
        color: #3a3a3c;
        padding: 5px 10px;
    }
    .pa-segmented button + button {
        border-left: 1px solid #d1d1d6;
    }
    .pa-segmented button.on {
        background: #1d1d1f;
        color: #fff;
    }

    .pa-primary {
        border: 1px solid #d64541;
        background: #d64541;
        color: #fff;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 700;
        padding: 6px 16px;
    }
    .pa-primary:disabled {
        opacity: 0.45;
        cursor: default;
    }

    .pa-chan {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 0;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
    }
    .pa-chan-t {
        flex: 1;
        min-width: 0;
        line-height: 1.25;
    }
    .pa-chan-t small {
        display: block;
        color: #6e6e73;
        font-size: 11px;
    }
    .pa-chan-both {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        padding-top: 8px;
        flex-wrap: wrap;
    }
    .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11.5px;
    }
    .pa-scope {
        margin-bottom: 4px;
        font-size: 11.5px;
    }

    .pa-sessions {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .pa-sessions li {
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #f0f0f1;
        font-size: 12.5px;
    }
    .pa-session {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 6px;
        margin: 0 -6px;
        border: 0;
        border-radius: 6px;
        background: none;
        text-align: left;
        color: inherit;
        font: inherit;
        cursor: pointer;
    }
    .pa-session:hover {
        background: #f2f2f4;
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
    .pa-set-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px 0 0 180px;
        font-size: 11.5px;
    }
    .pa-set-note {
        margin: 2px 0 0 180px;
        font-size: 11.5px;
    }
    .pa-set-name.lg {
        font-size: 14px;
        margin-bottom: 2px;
    }
    .pa-conn-ok {
        color: #2e8b57;
        font-weight: 600;
    }
    .pa-conn-no {
        color: #8e8e93;
    }
    .pa-chip-btn.danger {
        color: #c0392b;
    }

    /* ===== tool tiles ===== */
    .pa-tiles {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
    }
    .pa-tile {
        position: relative;
        width: 88px;
        height: 88px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid #d8d8dc;
        border-radius: 14px;
        background: #fff;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
    }
    .pa-tile.on {
        border: 2px solid #2f6fde;
        background: #eaf1fd;
    }
    .pa-tile-check {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 1.5px solid #c7c7cc;
        font-size: 9px;
        font-weight: 800;
        line-height: 12px;
        color: #fff;
    }
    .pa-tile.on .pa-tile-check {
        border-color: #2f6fde;
        background: #2f6fde;
    }
    .pa-tile-ic {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: #f2f2f4;
        font-size: 14px;
        font-weight: 800;
    }
    .pa-tile-n {
        font-size: 11.5px;
        color: #1d1d1f;
    }

    /* ===== empty states ===== */
    .pa-empty {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        font-size: 13px;
        color: #48484a;
        padding: 22px;
    }

    /* ===== playback ===== */
    .pa-pb-head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .pa-back,
    .pa-link {
        border: 0;
        background: none;
        padding: 0;
        font-size: 12px;
        font-weight: 600;
        color: #0a66c2;
        cursor: pointer;
    }
    .pa-back {
        font-size: 13px;
        margin-right: auto;
    }
    .pa-link.warn {
        color: #d9822b;
    }
    .pa-pb-id {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: 11.5px;
    }
    .pa-pb-id code {
        font-size: 10.5px;
        color: #8e8e93;
    }
    .pa-pending {
        font-size: 11.5px;
        font-weight: 600;
        color: #d9822b;
        white-space: nowrap;
    }
    .pa-pb {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) 230px;
        gap: 12px;
        align-items: stretch;
    }
    .pa-pb.enlarged {
        grid-template-columns: minmax(0, 1fr);
    }
    .pa-seglist,
    .pa-keys {
        background: #fff;
        border: 1px solid #e2e2e4;
        border-radius: 10px;
        padding: 8px;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    .pa-seglist {
        width: 165px;
        gap: 3px;
    }
    .pa-mini-h {
        font-size: 11px;
        font-weight: 700;
        color: #8e8e93;
        margin: 0 0 4px 2px;
    }
    .pa-seg-row {
        display: flex;
        align-items: center;
        border-radius: 6px;
        padding-right: 6px;
    }
    .pa-seg-row.on {
        background: #e4ecfb;
    }
    .pa-seg-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        border: 0;
        background: none;
        padding: 6px;
        font-size: 12px;
        cursor: pointer;
        color: #1d1d1f;
    }
    .pa-seg-row.on .pa-seg-main b {
        font-weight: 700;
    }
    .pa-seg-main b {
        font-weight: 500;
    }
    .pa-seg-main small {
        font-size: 10.5px;
        color: #8e8e93;
    }
    .pa-trash {
        border: 0;
        background: none;
        font-size: 11px;
        opacity: 0.55;
        cursor: pointer;
        padding: 2px;
    }
    .pa-trash:hover {
        opacity: 1;
    }
    .pa-player {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .pa-player video {
        width: 100%;
        border-radius: 8px;
        background: #000;
        display: block;
    }
    .pa-player-bar {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 11.5px;
        color: #6e6e73;
    }
    .pa-keys-list {
        position: relative;
        overflow-y: auto;
        max-height: 300px;
        display: flex;
        flex-direction: column;
        gap: 1px;
        scroll-behavior: smooth;
    }
    .pa-key-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        border: 0;
        background: none;
        border-radius: 5px;
        padding: 4px;
        text-align: left;
        cursor: pointer;
        color: #1d1d1f;
        font-size: 11.5px;
    }
    .pa-key-row.on {
        background: #e4ecfb;
    }
    .pa-key-row .t {
        flex: none;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        color: #8e8e93;
    }
    .pa-key-row .ic {
        flex: none;
        font-size: 10px;
        color: #8e8e93;
    }
    .pa-key-row .x {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    /* ===== sheets (window selection, deletion request) ===== */
    .pa {
        position: relative;
    }
    .pa-overlay {
        position: absolute;
        inset: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 46px 18px 18px;
        background: rgba(0, 0, 0, 0.28);
    }
    .pa-sheet {
        width: min(720px, 100%);
        max-height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f6f6f7;
        border: 1px solid #d1d1d6;
        border-radius: 12px;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
        padding: 18px;
        font-size: 13px;
    }
    .pa-sheet-sm {
        width: min(440px, 100%);
    }
    .pa-sheet-h {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
    }
    .pa-sheet-toggles {
        display: flex;
        gap: 20px;
        font-size: 12.5px;
    }
    .pa-sheet-toggles label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
    }
    .pa-sheet-body {
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .pa-display {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12.5px;
    }
    .pa-display select {
        font-size: 12.5px;
        padding: 3px 6px;
        border-radius: 6px;
        border: 1px solid #d1d1d6;
        background: #fff;
    }
    .pa-wgrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
    }
    .pa-win {
        display: flex;
        flex-direction: column;
        gap: 5px;
        border: 0;
        background: none;
        padding: 0;
        cursor: pointer;
        min-width: 0;
    }
    .pa-win-thumb {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 82px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.14);
        outline: 2px solid transparent;
        outline-offset: 1px;
        overflow: hidden;
        transition: outline-color 0.12s ease;
    }
    .pa-win:hover .pa-win-thumb {
        outline-color: #b9cdf3;
    }
    .pa-win.on .pa-win-thumb {
        outline: 3px solid #2f6fde;
    }
    .pa-win-thumb img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
    }
    .pa-win-check {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2f6fde;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        line-height: 18px;
        text-align: center;
    }
    .pa-win-t {
        font-size: 11px;
        color: #3a3a3c;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
    }
    .pa-sheet-foot {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
    }
    .pa-sheet-foot .pa-quiet {
        margin-right: auto;
    }
    .pa-sheet textarea {
        font: inherit;
        font-size: 12.5px;
        border: 1px solid #d1d1d6;
        border-radius: 7px;
        padding: 7px 9px;
        resize: vertical;
    }

    /* ===== responsive ===== */
    @media (max-width: 860px) {
        .pa-cols,
        .pa-cols3,
        .pa-pb {
            grid-template-columns: 1fr;
        }
        .pa-seglist {
            width: auto;
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
        .pa-set-actions,
        .pa-set-note {
            margin-left: 0;
            flex-wrap: wrap;
        }
    }
</style>
