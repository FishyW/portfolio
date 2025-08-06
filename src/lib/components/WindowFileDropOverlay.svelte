<script lang="ts">
    import dropIcon from "$icons/symbols/share-symbolic.svg";
</script>

<!-- Drag and Drop Overlay -->
<div class="absolute h-full w-full p-4 pointer-events-none">
 <div class="border-dashed border-secondary-70 border-4 h-full w-full rounded-xl flex flex-col justify-center items-center">
    <img src={dropIcon} class="w-10 h-10 mb-2" alt="drop" />
    <div class="font-semibold text-secondary-60">Drag and Drop Your Files Here</div>
 </div>
</div>