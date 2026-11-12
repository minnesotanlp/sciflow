<script lang="ts">
    import "../app.css";
    import { base } from "$app/paths";
    import ParticipantAppDemo from "$lib/ParticipantAppDemo.svelte";
    import StoryTimeline from "$lib/StoryTimeline.svelte";
    import ExampleTimeline from "$lib/ExampleTimeline.svelte";

    // ---- Team: roles, contacts, accents ----
    const team = [
        {
            name: "Khanh Chi Le",
            avatar: `${base}/members/khanh-chi-le-crop.png`,
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


    // ---- SciFlowApp tool: the approved streams ----
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
            q: "Who owns this data?",
            a: "You do. You have full control over your data. Everything we do with your data will go through you.",
        },
        {
            q: "Is the point of this to have my job scoped by AI?",
            a: "No. We will not give your data to a big frontier lab or AI provider to develop AI models. The goal is to understand how real research unfolds so we can build AI to support researchers like you, not to replace them. If we ever wanted to use your data to develop a model, we would ask for your consent again.",
        },
        {
            q: "I don't want anyone watching me do something stupid or embarrassing.",
            a: "Research is messy, and we understand that. But we believe that messy process is what's really valuable to learn from. It's also a chance to review and learn from your own workflow together — not a critique. You also have full control of what you choose to share with us: pause recording at any time, exclude any app or window from being captured, and delete any data points. For data release, you can opt out of releasing anything you don't want shared.",
        },
        {
            q: "I switch back and forth between work and personal all the time.",
            a: "We account for that. For screen recording, you can select exactly which tabs or windows get recorded — your personal windows will not be recorded. The same goes for connected tools: only the specific Slack channels, Drive folders, and other items you approve are collected. And if there's ever anything you want deleted or don't want us to store, just tell us and we'll delete it.",
        },
        {
            q: "I don't want my data released to the public.",
            a: "You have total control over your data. You can opt out of releasing any individual data point you don't want shared. Beyond de-identifying your data, we'll triple-check with you about exactly what can and can't be released before anything goes out. From our side, we hope to contribute some of the collected data back to the research community, with your consent.",
        },
        {
            id: "faq-after-release",
            q: "What happens to my data after it's released publicly — can anyone use it?",
            a: "Your data will be treated as human subject data. Public access is gated and consent-based: anyone who wants to access it has to request it and get your consent, and it can only be used for research purposes — it is not freely distributed.",
        },
        {
            q: "What benefits do I get out of this study?",
            a: "Beyond compensation (co-authorship, or monetary value), you can opt in to a monthly report on your workflow with the insights we find. And if we were to ever develop a personalized, researcher-centered AI, we'll prioritize your lab. Many participants also find the tool useful for keeping their research tools and progress in one place.",
        },
    ];

    // Expand short answers by default; keep longer ones collapsed.
    let faqOpen = $state(faqs.map((f) => f.a.length < 320));
    function toggleFaq(i: number) {
        faqOpen[i] = !faqOpen[i];
    }
    function openFaq(id: string) {
        const i = faqs.findIndex((f) => f.id === id);
        if (i >= 0) faqOpen[i] = true;
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
                    We want to understand <b>how research actually unfolds in real time</b> &mdash; what strategies
                    researchers use, what cognitive state they're in, and how that shapes the next steps.
                    Our goal is to advance researcher-centered AI assistants: tools built to help
                    researchers, not replace them. SciFlow is calling for your effort to do that: capturing your
                    research in real time, through screen recording and your connected tools, from
                    brainstorming to publication.
                </p>
                <div class="hero-meta">
                    <span><b>Final outcome:</b> longitudinal computational research workflows (6–12 months) — open to
                        any field where most of the work happens on a laptop.</span>
                    <span><b>How we study it:</b> we ask you to do screen recordings, and we passively collect activity
                        from the tools you approve, such as Google Drive, Slack, Overleaf, GitHub, and your AI assistant (e.g.
                        Claude Code).</span>
                    <span><b>Participate:</b> your only responsibility is to do your research as usual. the SciFlowApp
                        tool records your approved streams in the background. We'll have reflection interviews to review
                        your activity together.</span>
                    <span><b>Compensation:</b> co-authorship, or paid per month of data you contribute ($70 the first
                        month, $30 each month after).</span>
                </div>
                <p class="hero-note">
                    Questions about data ownership, what we will do with your data, or privacy?
                    See the <a href="#faq">FAQ</a>.
                </p>
            </div>
        </div>
    </section>

    <!-- ===================== WORKED EXAMPLE (longitudinal timeline) ===================== -->
    <section id="example" class="section section-bg">
        <div class="section-inner">
            <h3>What a research project <span class="mk">actually looks like</span></h3>
            <p>
                Below is what the collected data looks like for a six-month mechanical engineering project. The
                published result has a clean structure, but the real path has numerous dead ends and pivots that never
                make it into print.
            </p>

            <div class="example-split" style="margin-top: 18px;">
                <ExampleTimeline />
                <StoryTimeline />
            </div>
        </div>
    </section>

    <!-- ===================== TOOL ===================== -->
    <section id="tool" class="section">
        <div class="section-inner">
            <h3>The tool &mdash; <span class="mk">SciFlowApp</span></h3>

            <p>
                We will install <b>SciFlowApp</b>, the app designed and developed by our team, on your laptop. It
                records your screen and connects to your workspace. It is also a data central hub: everything is
                transparent, and you can see all of your collected data in one place. You have full control over what
                to collect, what to exclude, and what to delete.
            </p>

            <p class="recruit-outcome">
                You choose exactly which folders, channels, repositories, projects, and screens are
                shared. Anything you don't approve is never collected &mdash; and you can revoke
                access to any stream at any time.
            </p>

            <ParticipantAppDemo />
        </div>
    </section>

    <!-- ===================== RECRUITMENT ===================== -->
    <section id="recruitment" class="section section-bg">
        <div class="section-inner">
            <h3>Get involved &mdash; <span class="mk">recruitment</span></h3>
            <div class="recruit">
                <div class="recruit-cols">
                    <div class="recruit-block participate">
                        <div class="rb-head">Researchers participate by:</div>
                        <div class="recruit-steps">
                            <div class="recruit-step">
                                <div class="rs-n">Step 1 · 1 hour</div>
                                <div class="rs-t">Onboarding</div>
                                <p class="rs-d">Set up SciFlowApp and choose which folders, channels, repos, and screens to approve.</p>
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
                                <div class="rs-n">Step 3</div>
                                <div class="rs-t">Reflection interviews</div>
                                <p class="rs-d">Review your recorded activity with us.</p>
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
                            <li>Email Chi at <a href="mailto:le000422@umn.edu?subject=SciFlow%20%E2%80%94%20onboarding">le000422@umn.edu</a> to set up onboarding.</li>
                            <li>Confirm participation with your PI.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ===================== FAQ ===================== -->
    <section id="faq" class="section">
        <div class="section-inner">
            <h4 style="margin-top: 0;">Frequently asked questions</h4>
            <div class="faq-list">
                {#each faqs as item, i}
                    <div class="faq-item" id={item.id} class:open={faqOpen[i]}>
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
    .hero-note {
        margin: 16px 0 0;
        font-family: var(--sans);
        font-size: 14px;
        font-style: italic;
        color: var(--clay-deep);
        max-width: none;
    }

    .hero-note a,
    .recruit-first-list a {
        color: var(--clay-deep);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    /* the sticky nav would otherwise cover an FAQ item jumped to from the data note */
    .faq-item {
        scroll-margin-top: 96px;
    }

    /* ---- SciFlowApp: supported tools + collection scope ---- */
    .stream-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 22px;
    }

    .stream-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 6px 12px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--cream);
        font-family: var(--sans);
        font-size: 13px;
        color: var(--espresso);
    }

    .stream-chip svg {
        width: 15px;
        height: 15px;
        flex: none;
        fill: var(--sky);
    }

    .sc-scope {
        color: var(--olive);
    }

    .sc-scope::before {
        content: "· ";
        color: var(--mute);
    }

</style>
