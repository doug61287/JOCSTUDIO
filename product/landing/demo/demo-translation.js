/**
 * JOCHero Demo - The Translation
 * 15-second seamless loop animation using GSAP
 */

// Configuration
const CONFIG = {
    duration: 15000, // Total demo duration in ms
    colors: {
        gold: '#FFD700',
        success: '#10B981',
        blue: '#3B82F6'
    }
};

// Sprinkler positions (matching SVG)
const SPRINKLER_POSITIONS = [
    { x: 60, y: 50 }, { x: 100, y: 50 }, { x: 60, y: 90 }, { x: 100, y: 90 },
    { x: 170, y: 50 }, { x: 210, y: 50 }, { x: 170, y: 90 }, { x: 210, y: 90 },
    { x: 280, y: 50 }, { x: 320, y: 50 }, { x: 360, y: 50 },
    { x: 280, y: 90 }, { x: 320, y: 90 }, { x: 360, y: 90 },
    { x: 60, y: 150 }, { x: 100, y: 150 }, { x: 140, y: 150 }, { x: 180, y: 150 },
    { x: 60, y: 200 }, { x: 100, y: 200 }, { x: 140, y: 200 }, { x: 180, y: 200 },
    { x: 240, y: 150 }, { x: 280, y: 150 }, { x: 320, y: 150 }, { x: 360, y: 150 },
    { x: 240, y: 200 }, { x: 280, y: 200 }, { x: 320, y: 200 }, { x: 360, y: 200 }
];

// DOM Elements
const elements = {
    container: null,
    pdfDrawing: null,
    toolbar: null,
    cursor: null,
    counterDisplay: null,
    counterValue: null,
    lengthDisplay: null,
    lengthValue: null,
    sidePanel: null,
    panelItems: null,
    processingOverlay: null,
    progressFill: null,
    progressText: null,
    proposalTable: null,
    tableBody: null,
    particles: null,
    ripples: null,
    countMarkers: null,
    sprinklers: null,
    mainPipe: null
};

// State
let masterTimeline = null;

// Initialize
function init() {
    // Cache DOM elements
    elements.container = document.getElementById('demo-container');
    elements.pdfDrawing = document.getElementById('pdf-drawing');
    elements.toolbar = document.getElementById('toolbar');
    elements.cursor = document.getElementById('cursor');
    elements.counterDisplay = document.getElementById('counter-display');
    elements.counterValue = document.getElementById('counter-value');
    elements.lengthDisplay = document.getElementById('length-display');
    elements.lengthValue = document.getElementById('length-value');
    elements.sidePanel = document.getElementById('side-panel');
    elements.panelItems = document.getElementById('panel-items');
    elements.processingOverlay = document.getElementById('processing-overlay');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressText = document.getElementById('progress-text');
    elements.proposalTable = document.getElementById('proposal-table');
    elements.tableBody = document.getElementById('table-body');
    elements.particles = document.getElementById('particles');
    elements.ripples = document.getElementById('ripples');
    elements.countMarkers = document.getElementById('count-markers');
    elements.sprinklers = document.querySelectorAll('.sprinkler');
    elements.mainPipe = document.getElementById('main-pipe');
    
    // Create and start the master timeline
    createMasterTimeline();
}

// Create master timeline with all scenes
function createMasterTimeline() {
    masterTimeline = gsap.timeline({
        repeat: -1, // Infinite loop
        repeatDelay: 0.5,
        onRepeat: resetDemo
    });
    
    // Scene 1: PDF Upload (0-2s)
    addScene1(masterTimeline);
    
    // Scene 2: Toolbar & Count (2-5s)
    addScene2(masterTimeline);
    
    // Scene 3: Length Measurement (5-8s)
    addScene3(masterTimeline);
    
    // Scene 4: Processing (8-11s)
    addScene4(masterTimeline);
    
    // Scene 5: Proposal (11-15s)
    addScene5(masterTimeline);
}

// Scene 1: PDF Upload (0-2s)
function addScene1(tl) {
    tl.addLabel('scene1')
        // Fade in PDF with scale
        .to(elements.pdfDrawing, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out'
        })
        // Add subtle floating animation
        .to(elements.pdfDrawing, {
            y: -5,
            duration: 1,
            ease: 'power1.inOut',
            yoyo: true
        }, '-=0.5');
}

// Scene 2: Toolbar & Count (2-5s)
function addScene2(tl) {
    tl.addLabel('scene2', '+=0.2')
        // Slide toolbar down
        .to(elements.toolbar, {
            top: 30,
            duration: 0.5,
            ease: 'power2.out'
        }, 'scene2')
        // Show cursor
        .to(elements.cursor, {
            opacity: 1,
            duration: 0.3
        }, 'scene2+=0.3')
        // Move cursor to Count tool and activate
        .to(elements.cursor, {
            left: '50%',
            top: 60,
            duration: 0.4,
            ease: 'power2.inOut'
        }, 'scene2+=0.4')
        .add(() => activateTool('count'), 'scene2+=0.8')
        // Show counter display
        .to(elements.counterDisplay, {
            opacity: 1,
            duration: 0.3
        }, 'scene2+=1');
    
    // Click sequence on sprinkler heads
    const clickPositions = [0, 4, 8, 14, 22]; // Indices of sprinklers to click visibly
    
    clickPositions.forEach((idx, i) => {
        const pos = SPRINKLER_POSITIONS[idx];
        const pdfRect = { x: 0, y: 0, scale: 1 }; // Will be calculated relative to PDF
        
        tl.to(elements.cursor, {
            left: `calc(15% + ${pos.x * 0.7}px)`,
            top: `calc(50% - 100px + ${pos.y * 0.7}px)`,
            duration: 0.2,
            ease: 'power2.inOut'
        }, `scene2+=${1.2 + i * 0.25}`)
        .add(() => {
            clickSprinkler(idx);
            updateCounter(idx + 1);
            createRipple(pos.x, pos.y);
        }, `scene2+=${1.3 + i * 0.25}`);
    });
    
    // Fast forward remaining sprinklers
    tl.add(() => {
        // Rapidly count remaining sprinklers
        let count = 5;
        const interval = setInterval(() => {
            count++;
            updateCounter(count);
            if (count >= 47) {
                clearInterval(interval);
                updateCounter(47);
                // Mark all sprinklers as clicked
                elements.sprinklers.forEach(s => s.classList.add('clicked'));
            }
        }, 20);
    }, 'scene2+=2.5');
    
    // Slide in side panel with measurement
    tl.to(elements.sidePanel, {
        right: 0,
        duration: 0.5,
        ease: 'power2.out'
    }, 'scene2+=2.8')
    .add(() => {
        addPanelItem('🚿', 'Sprinkler Heads', [
            { label: 'Count', value: '47' },
            { label: 'UPB', value: '21 10 00' }
        ], 'Mapped');
    }, 'scene2+=2.9');
}

// Scene 3: Length Measurement (5-8s)
function addScene3(tl) {
    tl.addLabel('scene3', '+=0.3')
        // Hide counter, show length display
        .to(elements.counterDisplay, {
            opacity: 0,
            duration: 0.2
        }, 'scene3')
        .to(elements.lengthDisplay, {
            opacity: 1,
            duration: 0.2
        }, 'scene3+=0.2')
        // Move cursor to Length tool
        .to(elements.cursor, {
            left: 'calc(50% + 60px)',
            top: 60,
            duration: 0.3,
            ease: 'power2.inOut'
        }, 'scene3+=0.2')
        .add(() => {
            activateTool('length');
        }, 'scene3+=0.5')
        // Move cursor to start of pipe
        .to(elements.cursor, {
            left: 'calc(15% + 28px)',
            top: 'calc(50% - 60px)',
            duration: 0.4,
            ease: 'power2.inOut'
        }, 'scene3+=0.6')
        // Draw pipe with length counter
        .to(elements.mainPipe, {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'none',
            onUpdate: function() {
                const progress = this.progress();
                const feet = Math.round(progress * 234);
                elements.lengthValue.textContent = feet;
            }
        }, 'scene3+=1')
        // Move cursor along pipe path
        .to(elements.cursor, {
            motionPath: {
                path: [
                    { left: 'calc(15% + 112px)', top: 'calc(50% - 60px)' },
                    { left: 'calc(15% + 112px)', top: 'calc(50% + 20px)' },
                    { left: 'calc(15% + 238px)', top: 'calc(50% + 20px)' }
                ],
                curviness: 0
            },
            duration: 2,
            ease: 'none'
        }, 'scene3+=1')
        // Add length to panel
        .add(() => {
            addPanelItem('📏', 'Main Run Pipe', [
                { label: 'Length', value: '234 ft' },
                { label: 'UPB', value: '21 10 00' }
            ], 'Mapped');
        }, 'scene3+=2.8');
}

// Scene 4: Processing (8-11s)
function addScene4(tl) {
    tl.addLabel('scene4', '+=0.3')
        // Fade out cursor
        .to(elements.cursor, {
            opacity: 0,
            duration: 0.3
        }, 'scene4')
        // Show processing overlay
        .to(elements.processingOverlay, {
            opacity: 1,
            duration: 0.5
        }, 'scene4+=0.2')
        // Create particles
        .add(() => createParticles(), 'scene4+=0.3')
        // Animate progress bar
        .to(elements.progressFill, {
            width: '30%',
            duration: 0.5
        }, 'scene4+=0.5')
        .add(() => updateProgressText('Analyzing measurements...'), 'scene4+=0.5')
        .to(elements.progressFill, {
            width: '60%',
            duration: 0.5
        }, 'scene4+=1')
        .add(() => updateProgressText('Mapping to UPB...'), 'scene4+=1')
        .to(elements.progressFill, {
            width: '90%',
            duration: 0.5
        }, 'scene4+=1.5')
        .add(() => updateProgressText('Calculating pricing...'), 'scene4+=1.5')
        .to(elements.progressFill, {
            width: '100%',
            duration: 0.4
        }, 'scene4+=2')
        .add(() => updateProgressText('Generating proposal...'), 'scene4+=2')
        // Hide overlay
        .to(elements.processingOverlay, {
            opacity: 0,
            duration: 0.5
        }, 'scene4+=2.8');
}

// Scene 5: Proposal (11-15s)
function addScene5(tl) {
    // Table data
    const tableData = [
        { item: '21 10 00 Sprinkler', qty: 47, unit: 'EA', price: 45.00 },
        { item: '21 10 00 Pipe', qty: 234, unit: 'LF', price: 8.50 },
        { item: '21 20 00 Alarm', qty: 12, unit: 'EA', price: 120.00 }
    ];
    
    tl.addLabel('scene5')
        // Move PDF left
        .to(elements.pdfDrawing, {
            left: '30%',
            scale: 0.8,
            duration: 0.6,
            ease: 'power2.out'
        }, 'scene5')
        // Hide side panel
        .to(elements.sidePanel, {
            right: -320,
            duration: 0.4
        }, 'scene5')
        .to(elements.lengthDisplay, {
            opacity: 0,
            duration: 0.2
        }, 'scene5')
        // Slide in proposal table
        .to(elements.proposalTable, {
            right: 40,
            duration: 0.6,
            ease: 'power2.out'
        }, 'scene5+=0.3')
        // Populate table rows
        .add(() => populateTable(tableData), 'scene5+=0.6');
    
    // Animate each row
    tableData.forEach((row, i) => {
        tl.add(() => {
            const tr = elements.tableBody.querySelectorAll('tr')[i];
            if (tr) {
                gsap.to(tr, {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        }, `scene5+=${0.8 + i * 0.2}`);
    });
    
    // Animate totals
    tl.add(() => {
        const subtotal = tableData.reduce((sum, r) => sum + (r.qty * r.price), 0);
        const tax = subtotal * 0.09;
        const total = subtotal + tax;
        
        animateNumber('subtotal', subtotal);
        animateNumber('tax', tax);
        
        gsap.to('#table-foot tr', {
            opacity: 1,
            stagger: 0.1,
            duration: 0.3
        });
        
        setTimeout(() => {
            animateNumber('total', total);
        }, 400);
    }, 'scene5+=1.5')
    // Show badge
    .to('.proposal-badge', {
        opacity: 1,
        duration: 0.3
    }, 'scene5+=2.2')
    // Show export buttons
    .to('.export-buttons', {
        opacity: 1,
        duration: 0.3
    }, 'scene5+=2.4')
    // Fade everything out for loop
    .to([elements.pdfDrawing, elements.proposalTable], {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
    }, 'scene5+=3.5');
}

// Helper functions
function activateTool(toolName) {
    document.querySelectorAll('.toolbar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tool === toolName) {
            item.classList.add('active');
        }
    });
}

function updateCounter(value) {
    elements.counterValue.textContent = value;
}

function clickSprinkler(index) {
    if (elements.sprinklers[index]) {
        elements.sprinklers[index].classList.add('clicked');
    }
}

function createRipple(x, y) {
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', x);
    ripple.setAttribute('cy', y);
    ripple.setAttribute('r', 4);
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', CONFIG.colors.gold);
    ripple.setAttribute('stroke-width', 2);
    ripple.setAttribute('opacity', 1);
    
    elements.ripples.appendChild(ripple);
    
    gsap.to(ripple, {
        attr: { r: 20 },
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
}

function addPanelItem(icon, title, rows, status) {
    const item = document.createElement('div');
    item.className = 'panel-item';
    
    let rowsHtml = rows.map(r => `
        <div class="panel-item-row">
            <span>${r.label}</span>
            <span>${r.value}</span>
        </div>
    `).join('');
    
    item.innerHTML = `
        <div class="panel-item-title">
            <span class="panel-item-icon">${icon}</span>
            ${title}
        </div>
        ${rowsHtml}
        <div class="panel-item-status">${status}</div>
    `;
    
    elements.panelItems.appendChild(item);
    
    gsap.to(item, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: 'power2.out'
    });
}

function createParticles() {
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${100 + Math.random() * 20}%`;
        elements.particles.appendChild(particle);
        
        gsap.to(particle, {
            top: `${-10 - Math.random() * 20}%`,
            opacity: 0.8,
            duration: 2 + Math.random() * 2,
            ease: 'none',
            delay: Math.random() * 0.5,
            onComplete: () => particle.remove()
        });
        
        gsap.to(particle, {
            left: `+=${(Math.random() - 0.5) * 100}`,
            duration: 2 + Math.random() * 2,
            ease: 'power1.inOut'
        });
    }
}

function updateProgressText(text) {
    elements.progressText.textContent = text;
}

function populateTable(data) {
    elements.tableBody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.item}</td>
            <td>${row.qty}</td>
            <td>${row.unit}</td>
            <td>$${row.price.toFixed(2)}</td>
            <td>$${(row.qty * row.price).toFixed(2)}</td>
        `;
        elements.tableBody.appendChild(tr);
    });
}

function animateNumber(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    gsap.to({ val: 0 }, {
        val: targetValue,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: function() {
            el.textContent = '$' + Math.round(this.targets()[0].val).toLocaleString();
        }
    });
}

function resetDemo() {
    // Reset all elements to initial state
    gsap.set(elements.pdfDrawing, { opacity: 0, scale: 0.95, left: '50%' });
    gsap.set(elements.toolbar, { top: -60 });
    gsap.set(elements.cursor, { opacity: 0, left: 100, top: 400 });
    gsap.set(elements.counterDisplay, { opacity: 0 });
    gsap.set(elements.lengthDisplay, { opacity: 0 });
    gsap.set(elements.sidePanel, { right: -320 });
    gsap.set(elements.processingOverlay, { opacity: 0 });
    gsap.set(elements.progressFill, { width: '0%' });
    gsap.set(elements.proposalTable, { right: -600, opacity: 1 });
    gsap.set('.proposal-badge', { opacity: 0 });
    gsap.set('.export-buttons', { opacity: 0 });
    gsap.set('#table-foot tr', { opacity: 0 });
    gsap.set(elements.mainPipe, { strokeDashoffset: 500 });
    
    // Clear dynamic elements
    elements.panelItems.innerHTML = '';
    elements.tableBody.innerHTML = '';
    elements.particles.innerHTML = '';
    
    // Reset sprinklers
    elements.sprinklers.forEach(s => s.classList.remove('clicked'));
    
    // Reset counters
    elements.counterValue.textContent = '0';
    elements.lengthValue.textContent = '0';
    elements.progressText.textContent = 'Analyzing...';
    
    // Reset tools
    document.querySelectorAll('.toolbar-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();
    resetDemo();
});
