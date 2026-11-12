<script lang="ts">
    import "../../app.css";
    import StoryTimeline from "$lib/StoryTimeline.svelte";
</script>

<svelte:head>
    <title>Research Flow — SciFlow</title>
</svelte:head>

<main style="max-width: 900px; margin: 0 auto; padding: 40px 20px;">
    <h1>Research Flow</h1>
    <p>An example six-month mechanical engineering project (synthetic data), rebuilt from the researcher's documents, messages, analysis code, and screen recordings, with the researcher's own explanations of why each turn happened.</p>
    <StoryTimeline />
</main>
