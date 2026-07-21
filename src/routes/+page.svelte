<script lang="ts">
    import "../app.css";
    import { base } from "$app/paths";
    import ParticipantAppDemo from "$lib/ParticipantAppDemo.svelte";
    import StoryTimeline from "$lib/StoryTimeline.svelte";

    // ---- Team: roles, contacts, accents ----
    const team = [
        {
            name: "Khanh Chi Le",
            avatar: `${base}/members/khanh-chi-le.jpg`,
            role: "Coordinator",
            sub: "Study coordinator · contact for participation",
            accent: "var(--olive)",
            links: [
                { label: "Email", href: "mailto:le000422@umn.edu?subject=SciFlow%20%E2%80%94%20interested" },
                { label: "Site ↗", href: "https://chile2706.github.io/", external: true },
            ],
        },
        {
            name: "Luan Chau",
            avatar: `${base}/members/luan-chau.jpg`,
            role: "Researcher",
            sub: "Cognitive scientist",
            accent: "var(--sky)",
            links: [{ label: "Email", href: "mailto:chau0139@umn.edu?subject=SciFlow" }],
        },
        {
            name: "Gulshoda Inomjonova",
            avatar: `${base}/members/gulshoda-inomjonova.svg`,
            role: "Researcher",
            sub: "Annotation tooling",
            accent: "var(--sky)",
            links: [{ label: "Email", href: "mailto:inomj003@umn.edu?subject=SciFlow" }],
        },
        {
            name: "Dongyeop Kang",
            avatar: `${base}/members/dongyeop-kang.jpg`,
            role: "PI",
            sub: "Principal Investigator · general inquiries",
            accent: "var(--clay)",
            links: [
                { label: "Email", href: "mailto:dongyeop@umn.edu?subject=SciFlow%20data%20collection" },
                { label: "Site ↗", href: "https://dykang.github.io/", external: true },
            ],
        },
    ];


    // ---- SciFlowCollection tool: the approved streams ----
    const streams = [
        {
            name: "Google Drive",
            what: "Documents and notes in the folders you approve — proposals, meeting notes, planning docs.",
            scope: "Approved folders only",
            icon: "M10 4h4l2 3h8v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Z",
        },
        {
            name: "Slack",
            what: "Lab and project discussion — questions, feedback, and decisions as they happen.",
            scope: "Approved channels only",
            icon: "M8 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 5V6a2 2 0 0 1 2-2Z",
        },
        {
            name: "GitHub",
            what: "Commits, branches, issues, and pull requests — how the code evolves over the project.",
            scope: "Approved repos only",
            icon: "M9 4a3 3 0 1 1-2 5.2V15a4 4 0 0 0 4 4h3.3a3 3 0 1 1 0 2H11a6 6 0 0 1-6-6V9.2A3 3 0 0 1 9 4Zm10 0a3 3 0 1 1-1 5.83V12h-2V9.83A3 3 0 0 1 19 4Z",
        },
        {
            name: "Overleaf",
            what: "The paper as it is written — revision history of your approved LaTeX projects.",
            scope: "Approved projects only",
            icon: "M8 2h10l4 4v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 8h8v2h-8v-2Zm0 4h8v2h-8v-2Zm0 4h6v2h-6v-2Z",
        },
        {
            name: "Claude Code",
            what: "AI-assisted work sessions — what you asked for, what was produced, what you kept.",
            scope: "Session logs, opt-in",
            icon: "M4 5h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 5 4 3.5L7 17v-2.4l2.2-1.1L7 12.4V10Zm7 6h6v2h-6v-2Z",
        },
        {
            name: "Screen recording",
            what: "Periodic recordings of the screens where you do research work.",
            scope: "Approved screens only",
            icon: "M4 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8v2h4v2H8v-2h4v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
        },
    ];

    // ---- FAQ (recruitment) ----
    const faqs = [
        {
            q: "Why is this project happening?",
            a: "No existing dataset captures a research project at this granularity — the full arc from first idea through publication, across every tool where the work happens, paired with the researcher's own account of what they were doing and why. SciFlow fills that gap, producing the empirical foundation for understanding how research actually unfolds and for building AI assistants grounded in real workflows.",
        },
        {
            q: "What data will you collect?",
            a: "Only streams you approve: documents in approved Google Drive folders, research-related Gmail, approved Slack channels, approved GitHub repositories, approved Overleaf projects, Claude Code session logs, and recordings of approved screens. We also record the three reflection interviews where we review your activity together.",
        },
        {
            q: "What is the time commitment?",
            a: "Your normal research is the data — there are no extra day-to-day tasks. Beyond a short onboarding session to set up the SciFlowCollection tool, participation is three reflection interviews over the course of the study, roughly every 4 months, where we review your recorded activity together.",
        },
        {
            q: "How much is the compensation?",
            a: "You receive $150 at each reflection interview, for a maximum of $450 over the course of your participation.",
        },
        {
            q: "Can I pause or stop participating?",
            a: "Yes. You can pause or stop your participation at any time without penalty — just let us know. You can also revoke access to any individual stream (a folder, channel, repository, or screen) at any time while continuing to participate with the rest.",
        },
        {
            q: "Who owns my data?",
            a: "The data is jointly owned by PI Dongyeop Kang and your PI (the Contributor PI). No data is publicly released without consent from you and your PI. You may participate without consenting to public release of your data.",
        },
        {
            q: "Will my data contain personally identifiable information?",
            a: "We do not publicly release personally identifiable information. We ask that you avoid recording it whenever possible — the tool only touches the folders, channels, repos, and screens you approve. If any appears in collected materials, it is removed or redacted before any broader sharing or release.",
        },
        {
            q: "Will my data be used to train AI models?",
            a: "The current purpose is to study how research workflows evolve and to evaluate AI research assistants — not to train models. If a future use case involves model training, PI Kang will contact you and obtain explicit agreement before that use. Until then, the data is not used for model training.",
        },
    ];

    // Expand short answers by default; keep longer ones collapsed.
    let faqOpen = $state(faqs.map((f) => f.a.length < 320));
    function toggleFaq(i: number) {
        faqOpen[i] = !faqOpen[i];
    }
</script>

<svelte:head>
    <title>SciFlow</title>
</svelte:head>

<div class="page">
    <header class="nav-wrapper">
        <nav class="nav">
            <a href={base || "/"} class="brand">
                <img class="brand-logo" src={`${base}/umn_nlp_logo.png`} alt="Minnesota NLP logo" />
                <span class="logo">
                    SciFlow
                    <span class="logo-sub">Minnesota NLP</span>
                </span>
            </a>

            <div class="links">
                <a href="#overview" class="underline-animate">Overview</a>
                <a href="#example" class="underline-animate">Example</a>
                <a href="#tool" class="underline-animate">Tool</a>
                <a href="#recruitment" class="underline-animate">Recruitment</a>
                <a href="#team" class="underline-animate">Team</a>
            </div>

            <a class="ghost-btn" href="mailto:le000422@umn.edu?subject=Contact%20Us"> Contact Us </a>
        </nav>
    </header>

    <!-- ===================== OVERVIEW ===================== -->
    <section id="overview" class="section">
        <div class="section-inner">
            <div class="badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    <path d="M20 2v4"></path><path d="M22 4h-4"></path>
                    <circle cx="4" cy="20" r="2"></circle>
                </svg>Research preview
            </div>

            <h1>SciFlow</h1>


            <div class="hero-panel">
                <p class="lede">
                    Research is months of intertwined, nonlinear work — but we only ever study it in simple, linear settings: controlled tasks, retrospective interviews. SciFlow captures the full complexity: <b>tracking research trajectories in real time</b>. The goal: capture both the full trajectory of a research project and the <b>intention behind each action </b> — what researchers did, why they did it, and how it shaped what came next.
                </p>
                <div class="hero-meta">
                    <span><b>Final outcome:</b> longitudinal research workflows — up to 12 months each — spanning CS, engineering, health sciences, and the humanities.</span>
                    <span><b>How we study it:</b> we capture research activity across the tools where it
                        actually happens &mdash; Overleaf, GitHub, Slack, Google Drive, Claude
                        Code, and approved screen recordings &mdash; and align it into a single project
                        timeline.</span>
                    <span><b>Participate:</b> keep doing your research as usual while the SciFlowCollection
                        tool records your approved streams. Three reflection interviews, roughly every
                        4 months, reviewing your activity together ($150 each, up to $450).</span>
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== WORKED EXAMPLE (longitudinal timeline) ===================== -->
    <section id="example" class="section section-bg">
        <div class="section-inner">
            <h3>A research project, <span class="mk">replayed</span></h3>
            <p>
                An example research trajectory — reconstructed from recordings, code sessions, messages, and document edits — replayed as a single timeline.
            </p>

            <p class="anno-caption" style="margin-top: 18px;">
                <span class="ai-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    </svg>
                    Interactive demo · synthetic data
                </span>
                <span>Explore the timeline below — it auto-scrolls, or scroll manually. Everything shown is demo data, not from a real participant.</span>
            </p>

            <StoryTimeline />
        </div>
    </section>

    <!-- ===================== TOOL ===================== -->
    <section id="tool" class="section section-bg">
        <div class="section-inner">
            <h3>The tool &mdash; <span class="mk">SciFlowCollection</span></h3>

            <p>
                <b>SciFlowCollection</b> is a desktop app that acts as both a recording tool and
                a central hub for your research. Connect your existing workspace and see your edits,
                messages, commits, and revisions in one place. It connects only to the items you
                explicitly approve and captures your research activity in the background while
                you work as usual.
            </p>

            <h4 style="margin-top: 32px;">Currently supported integrations</h4>
            <div class="tool-grid">
                {#each streams as s}
                    <div class="tool-card">
                        <div class="tc-head">
                            <span class="tc-ic"><svg viewBox="0 0 28 28" aria-hidden="true"><path d={s.icon} /></svg></span>
                            <span class="tc-name">{s.name}</span>
                        </div>
                        <p class="tc-what">{s.what}</p>
                        <span class="tc-scope">{s.scope}</span>
                    </div>
                {/each}
            </div>

            <p class="anno-caption" style="margin-top: 18px;">
                <span class="ai-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>
                    </svg>
                    Interactive demo · synthetic data
                </span>
                <span>Explore the app below &mdash; click through the sidebar. Everything shown is demo data, not from a real participant.</span>
            </p>

            <ParticipantAppDemo />

            <p class="recruit-outcome">
                You choose exactly which folders, channels, repositories, projects, and screens are
                shared. Anything you don't approve is never collected &mdash; and you can revoke
                access to any stream at any time.
            </p>
        </div>
    </section>

    <!-- ===================== RECRUITMENT ===================== -->
    <section id="recruitment" class="section">
        <div class="section-inner">
            <h3>Get involved &mdash; <span class="mk">recruitment</span></h3>
            <p>
                Help us understand how research really unfolds. You keep doing your normal research
                while SciFlowCollection records your approved streams; we meet for three reflection
                interviews over the course of your participation, roughly every 4 months, to
                review your recorded activity together. You receive <b>$150 at each reflection
                interview, up to $450 total</b> &mdash; and you can pause or stop at any time without
                penalty.
            </p>

            <div class="recruit">
                <p class="recruit-lede">
                    <b>If you're actively working on a research project:</b> AI research assistants
                    are an exciting direction, and a first step is understanding how real research
                    workflows evolve over months.
                </p>

                <div class="recruit-cols">
                    <div class="recruit-block participate">
                        <div class="rb-head">Researchers participate by:</div>
                        <div class="recruit-steps">
                            <div class="recruit-step">
                                <div class="rs-n">Step 1 · 30 min</div>
                                <div class="rs-t">Onboarding</div>
                                <p class="rs-d">Set up SciFlowCollection and choose which folders, channels, repos, and screens to approve.</p>
                                <div class="rs-ic">
                                    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M42 27 58 27 58 24C58 21.8 56.2 20 54 20L12 20C9.8 20 8 21.8 8 24L8 51C8 53.2 9.8 55 12 55L18 55 18 65 28 55 34 55 34 35C34 30.6 37.6 27 42 27Z" />
                                        <path d="M84 31 42 31C39.8 31 38 32.8 38 35L38 62C38 64.2 39.8 66 42 66L68 66 78 76 78 66 84 66C86.2 66 88 64.2 88 62L88 35C88 32.8 86.2 31 84 31Z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="recruit-step">
                                <div class="rs-n">Step 2 · ongoing</div>
                                <div class="rs-t">Work as usual</div>
                                <p class="rs-d">Do your normally planned research; the tool records your approved streams in the background.</p>
                                <div class="rs-ic">
                                    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M12 30h44a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4Z" />
                                        <path d="M64 44 86 32v32L64 52Z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="recruit-step">
                                <div class="rs-n">Step 3 · every ~4 months</div>
                                <div class="rs-t">Reflection ×3</div>
                                <p class="rs-d">Review your recorded activity with us. $150 at each of the three interviews.</p>
                                <div class="rs-ic">
                                    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M42 27 58 27 58 24C58 21.8 56.2 20 54 20L12 20C9.8 20 8 21.8 8 24L8 51C8 53.2 9.8 55 12 55L18 55 18 65 28 55 34 55 34 35C34 30.6 37.6 27 42 27Z" />
                                        <path d="M84 31 42 31C39.8 31 38 32.8 38 35L38 62C38 64.2 39.8 66 42 66L68 66 78 76 78 66 84 66C86.2 66 88 64.2 88 62L88 35C88 32.8 86.2 31 84 31Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="recruit-block first">
                        <div class="rb-head">First steps if interested:</div>
                        <ol class="recruit-first-list">
                            <li>Fill out the interest form (below).</li>
                            <li>Book an onboarding session (below).</li>
                            <li>Confirm participation with your PI.</li>
                        </ol>
                    </div>
                </div>
            </div>

            <!-- Get started CTAs -->
            <h4 style="margin-top: 36px;">Get started</h4>
            <div class="cta-grid">
                <div class="side-card cta-card">
                    <h4>1. Book an onboarding session</h4>
                    <p>
                        Schedule a 30-minute call to learn how the study works and set up the
                        SciFlowCollection tool.
                    </p>
                    <!-- TODO: replace with the real booking link -->
                    <a href="mailto:le000422@umn.edu?subject=SciFlow%20%E2%80%94%20onboarding" rel="noopener noreferrer">
                        <button class="primary-btn">Book an appointment</button>
                    </a>
                </div>

                <div class="side-card cta-card">
                    <h4>2. Sign up</h4>
                    <p>
                        Fill out our short form to tell us about your research project so we can get
                        you started.
                    </p>
                    <!-- TODO: replace with the real interest-form link -->
                    <a href="mailto:le000422@umn.edu?subject=SciFlow%20%E2%80%94%20interest%20form" rel="noopener noreferrer">
                        <button class="secondary-btn cta-btn">Fill out the form</button>
                    </a>
                </div>
            </div>

            <!-- FAQ -->
            <h4 style="margin-top: 36px;">Frequently asked questions</h4>
            <div class="faq-list">
                {#each faqs as item, i}
                    <div class="faq-item" class:open={faqOpen[i]}>
                        <button class="faq-question" onclick={() => toggleFaq(i)} aria-expanded={faqOpen[i]}>
                            <span>{item.q}</span>
                            <span class="faq-icon">{faqOpen[i] ? "−" : "+"}</span>
                        </button>
                        <div class="faq-answer-wrapper" class:open={faqOpen[i]}>
                            <p class="faq-answer">{item.a}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- ===================== TEAM ===================== -->
    <section id="team" class="section section-bg">
        <div class="section-inner">
            <h3>Team</h3>
            <p>
                Reach out to the study coordinator about participating, or to the PI for general
                inquiries and cross-project collaboration.
            </p>
            <div class="team-grid">
                {#each team as member}
                    <div class="member-card" style="--accent: {member.accent}">
                        <img src={member.avatar} alt={member.name} class="member-avatar" />
                        <span class="member-role-tag">{member.role}</span>
                        <span class="member-name">{member.name}</span>
                        <p class="member-sub">{member.sub}</p>
                        <div class="member-links">
                            {#each member.links as link}
                                <a
                                    href={link.href}
                                    target={link.external ? "_blank" : undefined}
                                    rel={link.external ? "noopener noreferrer" : undefined}
                                >
                                    {link.label}
                                </a>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <footer>© 2026 Minnesota NLP Lab · University of Minnesota</footer>
</div>

<style>
    /* ---- SciFlow track palette (longitudinal streams) ---- */
    :global(:root) {
        --c-mile: #3e6b6e;
        --c-write: #6e7150;
        --c-code: #9aa77f;
        --c-code-tx: #26301a;
        --c-comm: #b0791f;
        --c-ai: #7c5f8d;
    }

    /* row heights (shared by labels + tracks) */
    :global(.h-months) {
        height: 26px;
    }
    :global(.h-mile) {
        height: 40px;
    }
    :global(.h-write),
    :global(.h-code),
    :global(.h-comm),
    :global(.h-ai) {
        height: 60px;
    }

    /* month ruler */
    .htl-months {
        display: flex;
        background: var(--card);
    }

    .htl-month {
        flex: 1 1 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 7px;
        border-right: 1px solid var(--line);
        font-family: var(--sans);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--mute);
    }

    .htl-month:last-child {
        border-right: none;
    }

    /* stream block colors */
    :global(.htl-block.mile) {
        background: var(--c-mile);
        color: #fff;
    }
    :global(.htl-block.write) {
        background: var(--c-write);
        color: #fff;
    }
    :global(.htl-block.codeb) {
        background: var(--c-code);
        color: var(--c-code-tx);
    }
    :global(.htl-block.comm) {
        background: var(--c-comm);
        color: #fff;
    }
    :global(.htl-block.aib) {
        background: var(--c-ai);
        color: #fff;
    }

    /* two-line block content: label + annotation codes */
    :global(.htl-block) {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 2px;
    }

    .htl-block-label {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-align: left;
    }

    .htl-block-code {
        display: block;
        width: 100%;
        font-size: 9.5px;
        font-weight: 500;
        opacity: 0.72;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
    }

    .htl-code-pill {
        display: inline-flex;
        align-items: center;
        font-family: var(--sans);
        font-size: 9px;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.4);
        border-radius: 5px;
        padding: 2px 6px;
        margin-right: 3px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    }

    /* replay controls */
    .htl-controls {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin: 0 0 14px;
    }

    .play-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        background: var(--clay);
        border: 2px solid var(--clay);
        border-radius: 10px;
        padding: 8px 16px;
        transition: 0.2s ease;
    }

    .play-btn:hover {
        background: var(--clay-deep);
        border-color: var(--clay-deep);
    }

    .play-btn svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
    }

    .htl-clock {
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 600;
        color: var(--brown);
        background: var(--cream);
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 5px 13px;
    }

    /* ---- SciFlowCollection stream cards ---- */
    .tool-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-top: 22px;
    }

    @media (max-width: 720px) {
        .tool-grid {
            grid-template-columns: 1fr;
        }
    }

    .tool-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--cream);
        padding: 16px 18px 18px;
    }

    .tc-head {
        display: flex;
        align-items: center;
        gap: 9px;
    }

    .tc-ic {
        width: 30px;
        height: 30px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        background: var(--card);
        border: 1px solid var(--line);
        color: var(--sky);
    }

    .tc-ic svg {
        width: 17px;
        height: 17px;
        fill: currentColor;
    }

    .tc-name {
        font-family: var(--serif);
        font-size: 17px;
        font-weight: 600;
        color: var(--espresso);
    }

    .tc-what {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--mute);
        max-width: none;
        flex: 1;
    }

    .tc-scope {
        align-self: flex-start;
        font-family: var(--sans);
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--olive);
        border: 1.5px solid var(--olive);
        border-radius: 999px;
        padding: 2px 10px;
    }

</style>
