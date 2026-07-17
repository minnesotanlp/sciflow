<script lang="ts">
    import "../../app.css";
    import { base } from "$app/paths";
    import { onMount } from "svelte";

    // Recruitment content lives on the front page under #recruitment.
    // Keep this route working for any existing links by redirecting there.
    onMount(() => {
        window.location.replace(`${base || ""}/#recruitment`);
    });
</script>

<svelte:head>
    <title>Participate | SciFlow</title>
    <meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
    <section class="section">
        <div class="section-inner">
            <h3>Redirecting…</h3>
            <p>
                Recruitment details have moved to the home page.
                <a class="underline-animate" href={`${base || ""}/#recruitment`}>Continue to recruitment →</a>
            </p>
        </div>
    </section>
</div>
