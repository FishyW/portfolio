
<script lang="ts">

    let { children, minHeight = 200, minWidth = 200 } = $props();

	let parent: HTMLDivElement = $state()!; 
    let child: HTMLDivElement = $state()!;
    let isDragging = $state(false);

    let offset = {x: 0, y: 0};
    let currentTranslate = {x: 0, y: 0};
    let mInit = { x: 0, y: 0 };
    let mNow = { x: 0, y: 0 };

    const DELTA = 5;
    let handler: number;
    let directionX: number = -1;
    let directionY: number = -1;
    let directionIdxTrack = -1;
    let directionIdx = -1;

    // check if a point is within a bounding box
    function within(
        checkX: number, checkY: number,
        left: number, right: number,
        top: number, bottom: number
    ) {
        return checkX  >= left && checkX <= right && checkY >= top && checkY <= bottom 
    }

    function resize() {        
        if (isDragging) {
            if (mNow.x >= document.documentElement.clientWidth - DELTA
                || mNow.y >= document.documentElement.clientHeight - DELTA
                || mNow.x <= DELTA
                || mNow.y <= DELTA
            ) {
                handler = requestAnimationFrame(resize);
                return;
            }
            

            offset.x = directionX * (mNow.x - mInit.x) + currentTranslate.x;
            offset.y = directionY * (mNow.y - mInit.y) + currentTranslate.y;

            if (offset.x >= minWidth) {
                parent.style.width = `${offset.x}px`;
            }

            if (offset.y >= minHeight) {
                parent.style.height = `${offset.y}px`;
            }            
            
            handler = requestAnimationFrame(resize);
        } else {
            currentTranslate.x = offset.x;
            currentTranslate.y = offset.y;
            cancelAnimationFrame(handler);
        }

    }

    function handleMove() {
        // left region
        const rectParent = parent.getBoundingClientRect();
        const rectChild = child.getBoundingClientRect();
        

        // left, right, top, bottom, top-left, bottom-left, top-right, bottom-right
        const bounds = [
            [rectParent.left, rectChild.left, rectChild.top, rectChild.bottom],
            [rectChild.right, rectParent.right, rectChild.top, rectChild.bottom],
            [rectChild.left, rectChild.right, rectParent.top, rectChild.top],
            [rectChild.left, rectChild.right, rectChild.bottom, rectParent.bottom],
            [rectParent.left, rectChild.left, rectParent.top, rectChild.top],
            [rectParent.left, rectChild.left, rectChild.bottom, rectParent.bottom],
            [rectChild.right, rectParent.right, rectParent.top,  rectChild.top],
            [rectChild.right, rectParent.right, rectChild.bottom, rectParent.bottom]
        ]

        let found = false;
        for (const [id, bound] of bounds.entries()) {
            if (
                within(mNow.x, mNow.y, 
                bound[0], bound[1], 
                bound[2], bound[3])
            ) {
                directionIdxTrack = id;
                found = true
            }
            
        }
        if (!found) {
            directionIdxTrack = -1;
        }

    }

    function initializeDrag() {
        document.body.style.cursor = parent.style.cursor;
        const grandparent = parent.parentElement as HTMLDivElement;

        currentTranslate.x = parent.getBoundingClientRect().width;
        currentTranslate.y = parent.getBoundingClientRect().height;

        const top =  parent.getBoundingClientRect().top - grandparent.getBoundingClientRect().top;
        const left =  parent.getBoundingClientRect().left - grandparent.getBoundingClientRect().left;
        const bottom = grandparent.getBoundingClientRect().bottom - parent.getBoundingClientRect().bottom;
        const right =  grandparent.getBoundingClientRect().right - parent.getBoundingClientRect().right;

        const directions: ([number, number])[] = [
                [-1, 0], [1,0], [0,-1], [0,1], [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]

        directionX = directions[directionIdx][0];
        directionY = directions[directionIdx][1];

        if (directionY > 0) {
            parent.style.top = `${top}px`;
            parent.style.bottom = "initial";
        }  else {
           parent.style.top = 'initial';
            parent.style.bottom = `${bottom}px`;
        }

        if (directionX > 0) {
            parent.style.left = `${left}px`;
            parent.style.right = 'initial';
        }  else {
            parent.style.left = 'initial';
            parent.style.right = `${right}px`;
        }
    }

    function initPos(node: HTMLDivElement) {
        const rect = node.getBoundingClientRect();
        node.style.top = `${-rect.height/2}px`;
        node.style.left = `${-rect.width/2}px`;
    }

</script>

<svelte:window 

onmouseup={e => {
     e.preventDefault();
    isDragging = false;
    document.body.style.cursor = "initial";
}}

onmousemove={e => {
    e.preventDefault();
    
    mNow.x = e.clientX;
    mNow.y = e.clientY;
    handleMove();
}}

/>
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div
  use:initPos
  onmousemove={_ => {
        if (isDragging) {
            return;
        }
        if (directionIdxTrack === -1) {
            parent.style.cursor = "initial";
            return;
        }
        const cursorNames = [
            'w-resize', 'e-resize', 'n-resize', 's-resize', 
            'nw-resize', 'sw-resize', 'ne-resize', 'se-resize'
        ]
        parent.style.cursor = cursorNames[directionIdxTrack];
  }}
  
  onmousedown={e => {
     // not a left click
    if (e.button !== 0) {
        return;
    }

    // lock the direction index
    directionIdx = directionIdxTrack; 
    
    if (directionIdx === -1) {
        return;
    }

    e.preventDefault();

    initializeDrag();

    
    // propagate onclick
    mNow.x = e.clientX;
    mNow.y = e.clientY;

    mInit = structuredClone(mNow);
    requestAnimationFrame(resize);
    isDragging = true;

    e.target!.dispatchEvent(new Event("click", {bubbles: true}));
}}
		bind:this={parent}
        style:width={`${minWidth}px`}
        style:height={`${minHeight}px`}
		class="p-4 absolute">
    <div 
        bind:this={child}
		class="h-full">
            {@render children()}
    </div>
  </div>


