/**
 * JOCHero Demo - The Translation Engine
 * 20-second seamless loop animation using GSAP
 * 
 * Timeline:
 * Scene 1: The Upload (0-3s)
 * Scene 2: The Analysis (3-8s)
 * Scene 3: The Catalog Match (8-13s)
 * Scene 4: The Cross-Check (13-16s)
 * Scene 5: The Output (16-20s)
 * Scene 6: Loop Reset (20s)
 */

// Configuration
const CONFIG = {
    duration: 20, // Total demo duration in seconds
    colors: {
        gold: '#FFD700',
        success: '#10B981',
        blue: '#3B82F6',
        cyan: '#22D3EE'
    }
};

// DOM Elements Cache
const elements = {};

// Master Timeline
let masterTimeline = null;

/**
 * Initialize the demo
 */
function init() {
    cacheElements();
    hideAllScenes();
    createMasterTimeline();
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
    // Container
    elements.container = document.getElementById('demo-container');
    elements.cursor = document.getElementById('cursor');
    elements.ripplesContainer = document.getElementById('ripples-container');
    
    // Scene 1: Upload
    elements.sceneUpload = document.getElementById('scene-upload');
    elements.dragFile = document.getElementById('drag-file');
    elements.uploadProgress = document.getElementById('upload-progress');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressText = document.getElementById('progress-text');
    elements.fileMetadata = document.getElementById('file-metadata');
    elements.uploadDropzone = document.querySelector('.upload-dropzone');
    
    // Scene 2: Analysis
    elements.sceneAnalysis = document.getElementById('scene-analysis');
    elements.scanLine = document.getElementById('scan-line');
    elements.tableRows = document.querySelectorAll('.takeoff-table .table-row');
    elements.bubbles = [
        document.getElementById('bubble-1'),
        document.getElementById('bubble-2'),
        document.getElementById('bubble-3')
    ];
    elements.statsPanel = document.getElementById('stats-panel');
    
    // Scene 3: Catalog Match
    elements.sceneCatalog = document.getElementById('scene-catalog');
    elements.matchItems = [
        document.getElementById('match-1'),
        document.getElementById('match-2'),
        document.getElementById('match-3')
    ];
    elements.catalogCards = [
        document.getElementById('catalog-1'),
        document.getElementById('catalog-2'),
        document.getElementById('catalog-3')
    ];
    elements.counterCurrent = document.getElementById('counter-current');
    elements.matchingDisplay = document.getElementById('matching-display');
    
    // Scene 4: Cross-Check
    elements.sceneCrosscheck = document.getElementById('scene-crosscheck');
    elements.validationItems = document.querySelectorAll('.validation-item');
    elements.ringFill = document.getElementById('ring-fill');
    elements.confidencePercent = document.getElementById('confidence-percent');
    elements.autoResolve = document.getElementById('auto-resolve');
    elements.valQtyValue = document.getElementById('val-qty-value');
    elements.valUnitsValue = document.getElementById('val-units-value');
    elements.valCatalogValue = document.getElementById('val-catalog-value');
    
    // Scene 5: Output
    elements.sceneOutput = document.getElementById('scene-output');
    elements.outputOriginal = document.getElementById('output-original');
    elements.outputTransformed = document.getElementById('output-transformed');
    elements.proposalRows = document.querySelectorAll('.proposal-row');
    elements.badges = [
        document.getElementById('badge-1'),
        document.getElementById('badge-2'),
        document.getElementById('badge-3')
    ];
    elements.exportButtons = document.getElementById('export-buttons');
    elements.ctaText = document.getElementById('cta-text');
    elements.subtotalValue = document.getElementById('subtotal-value');
    elements.taxValue = document.getElementById('tax-value');
    elements.grandTotal = document.getElementById('grand-total');
}

/**
 * Hide all scenes initially
 */
function hideAllScenes() {
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
        scene.style.opacity = '0';
        scene.style.visibility = 'hidden';
    });
}

/**
 * Show a specific scene
 */
function showScene(sceneElement) {
    return gsap.to(sceneElement, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.3
    });
}

/**
 * Hide a specific scene
 */
function hideScene(sceneElement) {
    return gsap.to(sceneElement, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            sceneElement.style.visibility = 'hidden';
        }
    });
}

/**
 * Create ripple effect at position
 */
function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    elements.ripplesContainer.appendChild(ripple);
    
    gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
}

/**
 * Animate counter with rolling effect
 */
function animateCounter(element, start, end, duration = 1, prefix = '', suffix = '') {
    const obj = { value: start };
    return gsap.to(obj, {
        value: end,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
            element.textContent = prefix + Math.round(obj.value) + suffix;
        }
    });
}

/**
 * Animate dollar amount
 */
function animateDollar(element, start, end, duration = 0.8) {
    const obj = { value: start };
    return gsap.to(obj, {
        value: end,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
            element.textContent = '$' + Math.round(obj.value).toLocaleString();
        }
    });
}

/**
 * Create the master timeline with all scenes
 */
function createMasterTimeline() {
    masterTimeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.5,
        onRepeat: resetDemo
    });
    
    // Scene 1: The Upload (0-3s)
    addScene1(masterTimeline);
    
    // Scene 2: The Analysis (3-8s)
    addScene2(masterTimeline);
    
    // Scene 3: The Catalog Match (8-13s)
    addScene3(masterTimeline);
    
    // Scene 4: The Cross-Check (13-16s)
    addScene4(masterTimeline);
    
    // Scene 5: The Output (16-20s)
    addScene5(masterTimeline);
    
    // Scene 6: Fade out for loop (20s)
    addSceneFadeOut(masterTimeline);
}

/**
 * Scene 1: The Upload (0-3s)
 */
function addScene1(tl) {
    const uploadCard = elements.sceneUpload.querySelector('.upload-card');
    const dropzone = elements.uploadDropzone;
    
    // Show scene and upload card
    tl.add(showScene(elements.sceneUpload), 0);
    tl.from(uploadCard, {
        y: 40,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out'
    }, 0);
    
    // Show cursor
    tl.to(elements.cursor, {
        opacity: 1,
        duration: 0.2
    }, 0.3);
    
    // Position cursor and drag file
    const containerRect = elements.container.getBoundingClientRect();
    const startX = 50;
    const startY = containerRect.height / 2;
    
    tl.set(elements.cursor, { left: startX, top: startY }, 0.3);
    tl.set(elements.dragFile, { left: startX + 20, top: startY, opacity: 1 }, 0.3);
    
    // Animate file drag
    const dropzoneRect = dropzone.getBoundingClientRect();
    const endX = dropzoneRect.left + dropzoneRect.width / 2 - containerRect.left;
    const endY = dropzoneRect.top + dropzoneRect.height / 2 - containerRect.top;
    
    tl.to([elements.cursor, elements.dragFile], {
        left: endX,
        top: endY,
        duration: 0.8,
        ease: 'power2.inOut',
        onStart: () => {
            dropzone.classList.add('active');
        }
    }, 0.5);
    
    // Drop file with ripple
    tl.to(elements.dragFile, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        onStart: () => {
            createRipple(endX, endY);
        }
    }, 1.3);
    
    // Hide cursor
    tl.to(elements.cursor, { opacity: 0, duration: 0.2 }, 1.3);
    
    // Show progress bar
    tl.to(elements.uploadProgress, { opacity: 1, duration: 0.2 }, 1.5);
    tl.to(elements.progressFill, {
        width: '100%',
        duration: 0.8,
        ease: 'power1.inOut'
    }, 1.6);
    tl.to(elements.progressText, {
        textContent: 'Processing...',
        duration: 0
    }, 2.0);
    
    // Show metadata
    tl.to(elements.fileMetadata, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
    }, 2.2);
    
    // Animate metadata numbers
    tl.add(animateCounter(document.getElementById('meta-lines'), 0, 247, 0.4), 2.3);
    tl.add(animateCounter(document.getElementById('meta-categories'), 0, 18, 0.3), 2.4);
    
    // Hide scene 1
    tl.add(hideScene(elements.sceneUpload), 2.9);
}

/**
 * Scene 2: The Analysis (3-8s)
 */
function addScene2(tl) {
    // Show scene with split reveal
    tl.add(showScene(elements.sceneAnalysis), 3);
    
    // Animate left panel
    tl.from('.analysis-left', {
        x: -50,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
    }, 3.1);
    
    // Animate right panel
    tl.from('.analysis-right', {
        x: 50,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
    }, 3.2);
    
    // Show and animate scan line
    tl.to(elements.scanLine, { opacity: 1, duration: 0.2 }, 3.5);
    tl.to(elements.scanLine, {
        top: '85%',
        duration: 2,
        ease: 'none'
    }, 3.5);
    
    // Highlight rows as scan line passes
    elements.tableRows.forEach((row, i) => {
        tl.to(row, {
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            duration: 0.1
        }, 3.6 + i * 0.25);
        tl.to(row, {
            backgroundColor: 'transparent',
            duration: 0.3
        }, 3.8 + i * 0.25);
    });
    
    // Pop in analysis bubbles with spring physics
    elements.bubbles.forEach((bubble, i) => {
        tl.to(bubble, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, 4.2 + i * 0.6);
    });
    
    // Hide scan line
    tl.to(elements.scanLine, { opacity: 0, duration: 0.2 }, 5.5);
    
    // Show statistics panel
    tl.to(elements.statsPanel, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
    }, 6.5);
    
    // Animate stat values
    tl.add(animateCounter(document.getElementById('stat-lines'), 0, 247, 0.4), 6.7);
    tl.add(animateCounter(document.getElementById('stat-cats'), 0, 18, 0.3), 6.8);
    tl.add(animateCounter(document.getElementById('stat-ambig'), 0, 12, 0.3), 6.9);
    
    // Hide scene 2
    tl.add(hideScene(elements.sceneAnalysis), 7.8);
}

/**
 * Scene 3: The Catalog Match (8-13s)
 */
function addScene3(tl) {
    // Show scene
    tl.add(showScene(elements.sceneCatalog), 8);
    
    // Fade in columns
    tl.from('.catalog-columns', {
        opacity: 0,
        duration: 0.3
    }, 8.1);
    
    // Sequential matching animation
    for (let i = 0; i < 3; i++) {
        const matchItem = elements.matchItems[i];
        const catalogCard = elements.catalogCards[i];
        const startTime = 8.5 + i * 1.3;
        
        // Highlight match item
        tl.to(matchItem, {
            className: 'match-item active',
            duration: 0.1
        }, startTime);
        
        // Show catalog card sliding in
        tl.to(catalogCard, {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: 'power2.out'
        }, startTime + 0.3);
        
        // Show checkmark
        const check = catalogCard.querySelector('.catalog-check');
        if (check) {
            tl.to(check, {
                opacity: 1,
                duration: 0.2,
                ease: 'back.out(2)'
            }, startTime + 0.6);
        }
        
        // De-highlight match item
        if (i < 2) {
            tl.to(matchItem, {
                className: 'match-item',
                duration: 0.1
            }, startTime + 1.0);
        }
    }
    
    // Fast-forward counter animation
    tl.add(() => {
        const counterEl = elements.counterCurrent;
        const counts = [45, 89, 134, 178, 210, 247];
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < counts.length) {
                counterEl.textContent = counts[idx];
                idx++;
            } else {
                clearInterval(interval);
            }
        }, 150);
    }, 12);
    
    // Hide scene 3
    tl.add(hideScene(elements.sceneCatalog), 12.8);
}

/**
 * Scene 4: The Cross-Check (13-16s)
 */
function addScene4(tl) {
    // Show scene
    tl.add(showScene(elements.sceneCrosscheck), 13);
    
    // Fade in panel
    tl.from('.validation-panel', {
        y: 30,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out'
    }, 13.1);
    
    // Animate validation items sequentially
    elements.validationItems.forEach((item, i) => {
        tl.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.25,
            ease: 'power2.out'
        }, 13.4 + i * 0.2);
    });
    
    // Animate validation counts
    tl.add(() => animateValueText(elements.valQtyValue, '247/247', 0.5), 13.5);
    tl.add(() => animateValueText(elements.valUnitsValue, '18/18', 0.4), 13.7);
    tl.add(() => animateValueText(elements.valCatalogValue, '235/247', 0.5), 14.1);
    
    // Animate confidence ring
    const circumference = 2 * Math.PI * 45; // radius = 45
    const targetOffset = circumference * (1 - 0.947); // 94.7%
    
    tl.to(elements.ringFill, {
        strokeDashoffset: targetOffset,
        duration: 1,
        ease: 'power2.out'
    }, 13.8);
    
    // Animate confidence percent
    tl.add(animateCounter(elements.confidencePercent, 0, 94.7, 1, '', '%'), 13.8);
    
    // Show auto-resolve
    tl.to(elements.autoResolve, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
    }, 15);
    
    // Update confidence to 97.2%
    const newOffset = circumference * (1 - 0.972);
    tl.to(elements.ringFill, {
        strokeDashoffset: newOffset,
        duration: 0.4,
        ease: 'power2.out'
    }, 15.3);
    tl.to(elements.confidencePercent, {
        textContent: '97.2%',
        duration: 0
    }, 15.5);
    
    // Hide scene 4
    tl.add(hideScene(elements.sceneCrosscheck), 15.8);
}

/**
 * Animate text value appearing character by character
 */
function animateValueText(element, finalText, duration) {
    const chars = finalText.split('');
    let currentText = '';
    const interval = duration * 1000 / chars.length;
    
    chars.forEach((char, i) => {
        setTimeout(() => {
            currentText += char;
            element.textContent = currentText;
        }, i * interval);
    });
}

/**
 * Scene 5: The Output (16-20s)
 */
function addScene5(tl) {
    // Show scene
    tl.add(showScene(elements.sceneOutput), 16);
    
    // Fade in original (dimmed)
    tl.to(elements.outputOriginal, {
        opacity: 1,
        duration: 0.3
    }, 16.1);
    
    // Fade in transformed (vibrant)
    tl.to(elements.outputTransformed, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
    }, 16.3);
    
    // Animate proposal rows
    elements.proposalRows.forEach((row, i) => {
        if (!row.classList.contains('ellipsis')) {
            tl.to(row, {
                opacity: 1,
                x: 0,
                duration: 0.2,
                ease: 'power2.out'
            }, 16.6 + i * 0.15);
        }
    });
    
    // Show ellipsis row
    const ellipsisRow = document.querySelector('.proposal-row.ellipsis');
    if (ellipsisRow) {
        tl.to(ellipsisRow, { opacity: 0.5, x: 0, duration: 0.2 }, 17.3);
    }
    
    // Animate totals
    tl.add(animateDollar(elements.subtotalValue, 0, 47247, 0.6), 17.4);
    tl.add(animateDollar(elements.taxValue, 0, 4252, 0.4), 17.6);
    tl.add(animateDollar(elements.grandTotal, 0, 51499, 0.6), 17.8);
    
    // Pop in badges
    elements.badges.forEach((badge, i) => {
        tl.to(badge, {
            opacity: 1,
            scale: 1,
            duration: 0.25,
            ease: 'back.out(1.5)'
        }, 18.2 + i * 0.15);
    });
    
    // Show export buttons
    tl.to(elements.exportButtons, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
    }, 18.7);
    
    // Show CTA
    tl.to(elements.ctaText, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
    }, 19);
}

/**
 * Scene 6: Fade out for loop reset
 */
function addSceneFadeOut(tl) {
    // Fade entire container to create seamless loop
    tl.to(elements.sceneOutput, {
        opacity: 0,
        duration: 0.5
    }, 19.5);
}

/**
 * Reset demo state for loop
 */
function resetDemo() {
    // Reset Scene 1
    gsap.set(elements.dragFile, { left: -100, top: '50%', opacity: 0, scale: 1 });
    gsap.set(elements.progressFill, { width: 0 });
    gsap.set(elements.uploadProgress, { opacity: 0 });
    gsap.set(elements.fileMetadata, { opacity: 0 });
    gsap.set(elements.progressText, { textContent: 'Uploading...' });
    elements.uploadDropzone?.classList.remove('active');
    
    // Reset Scene 2
    gsap.set(elements.scanLine, { top: '80px', opacity: 0 });
    elements.bubbles.forEach(bubble => {
        gsap.set(bubble, { opacity: 0, scale: 0.8, y: 10 });
    });
    gsap.set(elements.statsPanel, { opacity: 0, y: 10 });
    elements.tableRows.forEach(row => {
        gsap.set(row, { backgroundColor: 'transparent' });
    });
    
    // Reset Scene 3
    elements.matchItems.forEach(item => {
        item.className = 'match-item';
    });
    elements.catalogCards.forEach(card => {
        gsap.set(card, { opacity: 0, x: 20 });
        const check = card.querySelector('.catalog-check');
        if (check) gsap.set(check, { opacity: 0 });
    });
    if (elements.counterCurrent) elements.counterCurrent.textContent = '0';
    
    // Reset Scene 4
    elements.validationItems.forEach(item => {
        gsap.set(item, { opacity: 0, x: -10 });
    });
    const circumference = 2 * Math.PI * 45;
    gsap.set(elements.ringFill, { strokeDashoffset: circumference });
    if (elements.confidencePercent) elements.confidencePercent.textContent = '0%';
    gsap.set(elements.autoResolve, { opacity: 0, y: 10 });
    if (elements.valQtyValue) elements.valQtyValue.textContent = '0/247';
    if (elements.valUnitsValue) elements.valUnitsValue.textContent = '0/18';
    if (elements.valCatalogValue) elements.valCatalogValue.textContent = '0/247';
    
    // Reset Scene 5
    gsap.set(elements.outputOriginal, { opacity: 0 });
    gsap.set(elements.outputTransformed, { opacity: 0 });
    elements.proposalRows.forEach(row => {
        gsap.set(row, { opacity: 0, x: 10 });
    });
    elements.badges.forEach(badge => {
        gsap.set(badge, { opacity: 0, scale: 0.9 });
    });
    gsap.set(elements.exportButtons, { opacity: 0, y: 10 });
    gsap.set(elements.ctaText, { opacity: 0 });
    if (elements.subtotalValue) elements.subtotalValue.textContent = '$0';
    if (elements.taxValue) elements.taxValue.textContent = '$0';
    if (elements.grandTotal) elements.grandTotal.textContent = '$0';
    
    // Clear ripples
    elements.ripplesContainer.innerHTML = '';
}

/**
 * Public API for controlling the demo
 */
window.TranslationEngineDemo = {
    init: init,
    play: () => masterTimeline?.play(),
    pause: () => masterTimeline?.pause(),
    restart: () => {
        resetDemo();
        masterTimeline?.restart();
    },
    seek: (time) => masterTimeline?.seek(time)
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Detect if running in iframe and apply embedded class
        if (window.self !== window.top) {
            const container = document.getElementById('demo-container');
            if (container) container.classList.add('embedded');
        }
        init();
    });
} else {
    // Detect if running in iframe and apply embedded class
    if (window.self !== window.top) {
        const container = document.getElementById('demo-container');
        if (container) container.classList.add('embedded');
    }
    init();
}
