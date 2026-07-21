<script lang="ts">
    import "../../app.css";
    import StoryTimeline from "$lib/StoryTimeline.svelte";
</script>

<svelte:head>
    <title>Research Flow — SciFlow</title>
</svelte:head>

<main style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
    <h1>Research Flow</h1>
    <p>A replay of one participant's recent activity, reconstructed across recordings, Claude Code, Slack, and document edits.</p>
    <StoryTimeline />
</main>
