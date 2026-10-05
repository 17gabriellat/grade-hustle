import { signInWithGoogle, signOut, getCurrentUser } from './auth.js';
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Disable number input scroll change
    document.addEventListener('wheel', function(e) {
        if (document.activeElement && document.activeElement.type === 'number') {
            e.preventDefault();
        }
    }, { passive: false });

    const appDiv = document.getElementById('app');

    // Cek status autentikasi user
    const userContext = await getCurrentUser();

    if (!userContext) {
        // Render halaman Login (Elegan & Minimalis)
        renderLogin(appDiv);
    } else {
        const { dbUser } = userContext;

        // Pengecekan Mandatory Onboarding
        if (!dbUser || !dbUser.is_onboarded) {
            renderOnboarding(appDiv, dbUser);
        } else {
            renderDashboard(appDiv, dbUser);
        }
    }
});

function renderLogin(container) {
    container.innerHTML = `
        <div class="card fade-in" style="text-align: center; max-width: 420px; margin: 6rem auto;">
            <div style="margin-bottom: 2rem;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                </svg>
                <h2 class="elegant-title" style="font-size: 2rem;">Grade Hustle</h2>
                <p class="subtitle" style="font-size: 1.05rem; margin-top: 0.5rem;">Grade Hustle.</p>
            </div>
            
            <button id="loginBtn" class="btn btn-google">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Continue with Google
            </button>
            <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                Only for students brave enough to face reality.
            </p>
        </div>
    `;

    document.getElementById('loginBtn').addEventListener('click', signInWithGoogle);
}

function renderOnboarding(container, dbUser) {
    container.innerHTML = `
        <div class="card fade-in" style="max-width: 650px; margin: 3rem auto;">
            <h2 class="elegant-title" style="font-size: 1.8rem;">University Grading Scale</h2>
            <p class="subtitle" style="margin-bottom: 2rem;">Configure your university grading standards for accurate projection.</p>
            
            <form id="onboardingForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.85rem; color: var(--text-secondary); padding-right: 2.5rem;">
                    <div>Grade (e.g. A)</div>
                    <div>Min Score (e.g. 85)</div>
                    <div>GPA Weight (e.g. 4.0)</div>
                </div>
                
                <div id="scaleRows"></div>
                
                <button type="button" id="addRowBtn" style="background: none; border: 1px dashed var(--border-color); width: 100%; padding: 0.875rem; border-radius: 8px; cursor: pointer; color: var(--text-secondary); margin-bottom: 2rem; transition: var(--transition); font-family: inherit;">
                    + Add Another Grade
                </button>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; align-items: center;">
                    <button type="button" id="logoutBtn" style="background: transparent; color: var(--text-secondary); border: none; cursor: pointer; font-family: inherit;">Sign out temporarily</button>
                    <button type="submit" id="saveBtn" class="btn" style="background-color: var(--text-primary); color: white; width: auto;">Save & Start</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', signOut);

    const scaleRowsContainer = document.getElementById('scaleRows');
    const defaultScales = [
        { huruf: 'A', batas: 85, bobot: 4.0 },
        { huruf: 'B+', batas: 75, bobot: 3.5 },
        { huruf: 'B', batas: 70, bobot: 3.0 },
        { huruf: 'C+', batas: 65, bobot: 2.5 },
        { huruf: 'C', batas: 60, bobot: 2.0 },
        { huruf: 'D', batas: 50, bobot: 1.0 },
        { huruf: 'E', batas: 0, bobot: 0.0 }
    ];

    function createRow(huruf = '', batas = '', bobot = '') {
        const div = document.createElement('div');
        div.className = 'scale-row fade-in';
        div.style.animationDuration = '0.3s';
        div.innerHTML = `
            <input type="text" placeholder="Huruf" class="input-huruf" value="${huruf}" required>
            <input type="number" step="0.1" placeholder="Batas Bawah" class="input-batas" min="0" max="100" value="${batas}" required>
            <input type="number" step="0.1" placeholder="Bobot" class="input-bobot" min="0" max="4.0" value="${bobot}" required>
            <button type="button" class="remove-btn" title="Hapus">&times;</button>
        `;
        div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
        scaleRowsContainer.appendChild(div);
    }

    // Populate default
    defaultScales.forEach(s => createRow(s.huruf, s.batas, s.bobot));

    document.getElementById('addRowBtn').addEventListener('click', () => createRow());

    document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rows = document.querySelectorAll('.scale-row');
        const scales = [];
        let isValid = true;

        rows.forEach(row => {
            const h = row.querySelector('.input-huruf').value.trim();
            let b = parseFloat(row.querySelector('.input-batas').value); if(b<0)b=0; if(b>100)b=100; row.querySelector('.input-batas').value=b;
            let w = parseFloat(row.querySelector('.input-bobot').value); if(w<0)w=0; if(w>4.0)w=4.0; row.querySelector('.input-bobot').value=w;

            if (!h || isNaN(b) || isNaN(w)) isValid = false;
            scales.push({ user_id: dbUser.id, huruf: h, batas_bawah: b, bobot_ipk: w });
        });

        if (!isValid || scales.length === 0) {
            showNotification("Please fill out all fields correctly.", 'error');
            return;
        }

        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        // 1. Simpan ke grading_scales
        const { error: insertError } = await supabase.from('grading_scales').insert(scales);

        if (insertError) {
            showNotification("Failed to save scale: " + insertError.message, 'error');
            saveBtn.innerText = "Save & Start";
            saveBtn.disabled = false;
            return;
        }

        // 2. Update is_onboarded menjadi true
        const { error: updateError } = await supabase
            .from('users')
            .update({ is_onboarded: true })
            .eq('id', dbUser.id);

        if (updateError) {
            showNotification("Failed to update profile: " + updateError.message, 'error');
            saveBtn.innerText = "Save & Start";
            saveBtn.disabled = false;
            return;
        }

        // 3. Render Dashboard
        renderDashboard(container, dbUser);
    });
}

async function renderDashboard(container, dbUser) {
    container.innerHTML = `
        <div class="app-layout view-profile">
            <aside class="sidebar">
                <div style="margin-bottom: 2rem;">
                    <h2 class="elegant-title" style="font-size: 1.5rem; margin: 0;">Grade Hustle</h2>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">Grade Calculator</p>
                </div>
                <div class="sidebar-menu">
                    <div class="menu-item active" data-view="profile">👤 Profile & Scales</div>
                    <div class="menu-item" data-view="structure">🗂️ Academic Structure</div>
                    <div class="menu-item" data-view="grades">📝 Grade Input</div>
                    <div class="menu-item" data-view="projection">🔮 Grade Projection</div>
                    <div class="menu-item" data-view="simulator">🎓 Graduation Simulator</div>
                </div>
                <button id="logoutBtn" style="margin-top: auto; background: none; border: none; color: #ef4444; cursor: pointer; text-align: left; padding: 1rem; font-family: inherit; font-weight: 500;">Sign Out</button>
            </aside>
            
            <main class="main-content">
                <div id="profileView" class="fade-in">
                    <header style="margin-bottom: 2rem;">
                        <h1 class="elegant-title">Student Profile</h1>
                        <p class="subtitle">Your personal data and grading scale settings.</p>
                    </header>
                    
                    <div class="card" style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1.5rem; font-weight: 500;">Account Information</h3>
                        <div style="color: var(--text-secondary); display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; align-items: center;">
                            <strong style="color: var(--text-primary); font-weight: 500;">Name:</strong>
                            <span>${dbUser.display_name || 'No Name'}</span>
                            <strong style="color: var(--text-primary); font-weight: 500;">Email:</strong>
                            <span>${dbUser.email || '-'}</span>
                        </div>
                        <div id="academicSummaryContainer" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                            <!-- Injected by loadSemesters -->
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="margin-bottom: 0.5rem; font-weight: 500;">University Grading Scale</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
                            This table is used by The Extortionist Engine. Adjust if your university regulations change.
                        </p>
                        <div id="profileScalesContainer">
                            <p style="color: var(--text-secondary);">Loading scales...</p>
                        </div>
                    </div>
                </div>
                
                <div id="simulatorView" class="fade-in">
                    <header style="margin-bottom: 2rem;">
                        <h1 class="elegant-title">Graduation Simulator</h1>
                        <p class="subtitle">Calculate the minimum grade combination needed to salvage your target GPA.</p>
                    </header>
                    
                    <div class="card" style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1.5rem; font-weight: 500;">Current Status</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display:block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Current GPA</label>
                                <input type="number" step="0.01" id="sim-current-ipk" class="comp-input" placeholder="0.00" style="background: var(--surface-color);">
                            </div>
                            <div>
                                <label style="display:block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">SKS Completed</label>
                                <input type="number" step="1" id="sim-current-sks" class="comp-input" placeholder="0" style="background: var(--surface-color);">
                            </div>
                            <div>
                                <label style="display:block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Minimum Grade</label>
                                <select id="sim-min-grade" class="comp-input" style="background: var(--surface-color); padding: 0.5rem; border: 1px solid var(--border-color);"></select>
                            </div>
                            <div>
                                <label style="display:block; font-size: 0.85rem; color: var(--accent-color); font-weight:600; margin-bottom: 0.5rem;">TARGET FINAL GPA</label>
                                <input type="number" step="0.01" id="sim-target-ipk" class="comp-input" placeholder="e.g. 3.50" style="background: rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.3);">
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 0.5rem; font-weight: 500;">Remaining Courses</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Enter the list of remaining courses you have not taken or completed yet.</p>
                        
                        <div id="sim-courses-container"></div>
                        
                        <button id="sim-add-course" style="background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); width: 100%; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; margin-top: 1rem;">+ Add Remaining Course</button>
                    </div>

                    <button id="sim-calculate-btn" class="btn btn-google" style="width: 100%; justify-content: center; background: var(--text-primary); color: var(--bg-color); border: none; font-size: 1rem; padding: 1rem;">Simulate My Fate</button>

                    <div id="sim-result-panel" style="margin-top: 2rem; display: none;"></div>
                </div>
                
                <div id="dashboardView" class="fade-in">
                    <header style="margin-bottom: 2rem;">
                        <h1 class="elegant-title" id="dashboardTitle">Academic Structure</h1>
                        <p class="subtitle" id="dashboardSubtitle">Add semesters, courses, and components.</p>
                    </header>
                    
                    <div id="semestersContainer">
                        <p style="text-align: center; color: var(--text-secondary);">Loading data...</p>
                    </div>
                    
                    <button id="addSemesterBtn" class="btn" style="border: 1px dashed var(--border-color); background: transparent; color: var(--text-primary); margin-top: 1rem; width: 100%;">
                        + Add Semester
                    </button>
                </div>
            </main>
        </div>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', signOut);

    // Sidebar Navigation Logic
    const appLayout = container.querySelector('.app-layout');
    const menuItems = container.querySelectorAll('.menu-item');
    const dashTitle = document.getElementById('dashboardTitle');
    const dashSubtitle = document.getElementById('dashboardSubtitle');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
            
            const view = item.getAttribute('data-view');
            appLayout.className = `app-layout view-${view}`;
            
            if (view === 'structure') { 
                dashTitle.innerText = "Academic Structure"; 
                dashSubtitle.innerText = "Add semesters, courses, and configure component percentage weights."; 
            }
            if (view === 'grades' || view === 'projection') { 
                dashTitle.innerText = view === 'grades' ? "Grade Input" : "Proyeksi Nilai"; 
                dashSubtitle.innerText = view === 'grades' ? "Enter your actual obtained scores (0-100)." : "The Extortionist Engine: Face reality and prepare a strategy."; 
                document.querySelectorAll('.input-nama, .input-bobot').forEach(el => {
                    el.readOnly = true;
                    el.tabIndex = -1;
                });
            } else {
                document.querySelectorAll('.input-nama, .input-bobot').forEach(el => {
                    el.readOnly = false;
                    el.tabIndex = 0;
                });
            }
            if (view === 'simulator') {
                dashTitle.innerText = "Graduation Simulator"; 
                dashSubtitle.innerText = "Find the minimum grades required to hit your final target GPA.";
                if (window.initSimulator) window.initSimulator();
            }
        });
    });

    // Render Data
    await renderProfileScales(dbUser.id);
    await loadSemesters(container, dbUser.id);
    
    document.getElementById('addSemesterBtn').addEventListener('click', () => {
        showPrompt("Tambah Semester", [
            { name: 'nama', placeholder: 'Semester Name (e.g. Semester 1)', type: 'text' }
        ], async (results) => {
            if (!results.nama) return;
            const { error } = await supabase.from('semesters').insert([{ user_id: dbUser.id, nama_semester: results.nama }]);
            if (error) {
                showNotification("Failed to add semester", 'error');
            } else {
                showNotification("Semester added successfully", 'success');
                await loadSemesters(container, dbUser.id);
            }
        });
    });
}

async function renderProfileScales(userId) {
    const container = document.getElementById('profileScalesContainer');
    const { data: scales } = await supabase.from('grading_scales').select('*').eq('user_id', userId).order('batas_bawah', { ascending: false });
    
    if(!scales) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem; font-weight: 500; font-size: 0.85rem; color: var(--text-secondary); padding-left: 0.5rem;">
            <div>Grade (e.g. A)</div>
            <div>Min Score (0-100)</div>
            <div>GPA Weight (0-4.0)</div>
        </div>
    ` + scales.map(s => `
        <div class="scale-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem;">
            <input type="text" value="${s.huruf}" class="comp-input input-h" data-id="${s.id}" style="width: 100%;">
            <input type="number" step="0.1" value="${s.batas_bawah}" class="comp-input input-b" data-id="${s.id}" style="width: 100%;" min="0" max="100">
            <input type="number" step="0.1" value="${s.bobot_ipk}" class="comp-input input-w" data-id="${s.id}" style="width: 100%;" min="0" max="4.0">
        </div>
    `).join('') + `
        <button id="saveProfileScales" class="btn" style="margin-top: 1.5rem; background: transparent; border: 1px dashed var(--border-color); color: var(--text-primary); width: 100%;">
            Save Scale Changes
        </button>
    `;
    
    document.getElementById('saveProfileScales').addEventListener('click', async () => {
        const btn = document.getElementById('saveProfileScales');
        btn.innerText = "Saving...";
        
        const rows = container.querySelectorAll('.scale-row');
        let success = true;
        for(let row of rows) {
            const id = row.querySelector('.input-h').getAttribute('data-id');
            const h = row.querySelector('.input-h').value;
            let b = parseFloat(row.querySelector('.input-b').value); if(b<0)b=0; if(b>100)b=100; row.querySelector('.input-b').value=b;
            let w = parseFloat(row.querySelector('.input-w').value); if(w<0)w=0; if(w>4.0)w=4.0; row.querySelector('.input-w').value=w;
            const { error } = await supabase.from('grading_scales').update({ huruf: h, batas_bawah: b, bobot_ipk: w }).eq('id', id);
            if (error) success = false;
        }
        
        if (success) {
            showNotification("Grading scale updated successfully.", "success");
            // Update global scales
            window.__gradingScales = await supabase.from('grading_scales').select('*').eq('user_id', userId).order('batas_bawah', { ascending: false }).then(r => r.data);
            
            // Re-run engines for expanded courses
            document.querySelectorAll('.matkul-item.expanded').forEach(item => {
                runExtortionistEngine(item.getAttribute('data-course-id'));
            });
        } else {
            showNotification("Error occurred while saving scale.", "error");
        }
        btn.innerText = "Save Scale Changes";
    });
}

async function loadSemesters(container, userId) {
    const listContainer = container.querySelector('#semestersContainer');

    // Fetch scales
    const { data: gradingScales } = await supabase.from('grading_scales').select('*').eq('user_id', userId).order('batas_bawah', { ascending: false });
    window.__gradingScales = gradingScales; // Untuk engine

    // Fetch semester
    const { data: semesters, error: semError } = await supabase.from('semesters').select('*').eq('user_id', userId).order('created_at', { ascending: true });

    if (semError) {
        listContainer.innerHTML = `<p style="color: #ef4444;">Failed to load semester data.</p>`;
        return;
    }

    if (semesters.length === 0) {
        listContainer.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem; border: 1px dashed var(--border-color); border-radius: 12px; margin-bottom: 1rem;">No semesters yet. Please add a new one.</p>`;
        return;
    }

    // Fetch courses
    const { data: courses } = await supabase.from('courses').select('*').in('semester_id', semesters.map(s => s.id)).order('created_at', { ascending: true });

    let gradeComponents = [];
    if (courses && courses.length > 0) {
        const { data: gc } = await supabase.from('grade_components').select('*').in('course_id', courses.map(c => c.id)).order('created_at', { ascending: true });
        if (gc) gradeComponents = gc;
    }

    let totalSksAll = 0;
    if (courses) {
        totalSksAll = courses.reduce((sum, c) => sum + (c.sks || 0), 0);
    }
    
    let badge = container.querySelector('#totalSksBadge');
    if (!badge) {
        const subtitle = container.querySelector('#dashboardSubtitle');
        if (subtitle) {
            badge = document.createElement('div');
            badge.id = 'totalSksBadge';
            badge.style = "display: inline-block; margin-top: 0.75rem; background: rgba(99, 102, 241, 0.1); color: var(--accent-color); padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; border: 1px solid rgba(99, 102, 241, 0.2);";
            subtitle.parentNode.insertBefore(badge, subtitle.nextSibling);
        }
    }
    if (badge) badge.innerText = `Total SKS Taken: ${totalSksAll}`;

    listContainer.innerHTML = '';

    let globalQuality = 0;
    let globalSksDone = 0;
    let gradeCounts = {};

    semesters.forEach((sem, index) => {
        const semCourses = (courses || []).filter(c => c.semester_id === sem.id);
        const card = document.createElement('div');
        card.className = 'card semester-card fade-in';
        card.style.animationDuration = '0.4s';
        
        // Auto-collapse older semesters if there are multiple
        if (semesters.length > 1 && index < semesters.length - 1) {
            card.classList.add('collapsed');
        }

        let semTotalQuality = 0;
        let semTotalSksDone = 0;

        let coursesHTML = semCourses.length === 0
            ? `<p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">No courses yet.</p>`
            : `<div class="matkul-list">` + semCourses.map(c => {
                const cComps = gradeComponents.filter(gc => gc.course_id === c.id);

                let totalWeight = 0;
                let currentScore = 0;
                let emptyWeight = 0;

                const compsHTML = cComps.map(gc => {
                    const w = gc.bobot_persen || 0;
                    totalWeight += w;
                    if (gc.nilai_diperoleh !== null && gc.nilai_diperoleh !== '') {
                        currentScore += (parseFloat(gc.nilai_diperoleh) * (w / 100));
                    } else {
                        emptyWeight += w;
                    }
                    return `
                                        <div class="comp-row" data-comp-id="${gc.id}" style="background: var(--surface-color); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem; position: relative;">
                        <div style="grid-column: span 4; font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: -0.5rem; display: flex; gap: 1rem;">
                            <span style="flex: 2;">Component Name</span>
                            <span style="flex: 1;">Weight (%)</span>
                            <span class="label-score" style="flex: 1;">Score</span>
                            <span style="width: 20px;"></span>
                        </div>
                        <input type="text" class="comp-input input-nama" value="${gc.nama_komponen}" placeholder="e.g. Midterm">
                        <div style="position: relative; display: flex; align-items: center;">
                            <input type="number" step="1" class="comp-input input-bobot" value="${gc.bobot_persen}" placeholder="0" min="0" max="100" style="padding-right: 1.5rem;">
                            <span style="position: absolute; right: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; pointer-events: none;">%</span>
                        </div>
                        <input type="number" step="0.1" class="comp-input input-score" value="${gc.nilai_diperoleh !== null ? gc.nilai_diperoleh : ''}" placeholder="0-100" min="0" max="100">
                        <button class="remove-btn btn-delete-comp" type="button" title="Delete" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size: 1.2rem;">&times;</button>
                    </div>
                `}).join('');

                let finalGradeHTML = '';
                if (cComps.length > 0 && totalWeight > 0 && emptyWeight === 0) {
                    const grade = (gradingScales || []).find(s => currentScore >= s.batas_bawah) || (gradingScales || [])[(gradingScales || []).length - 1];
                    if (grade) {
                        finalGradeHTML = `<span class="live-grade-badge" data-huruf="${grade.huruf}" data-bobot-ipk="${grade.bobot_ipk}" data-sks="${c.sks}" style="background: var(--text-primary); color: var(--bg-color); padding: 0.15rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; margin-left: 0.5rem;" title="Final Score: ${currentScore.toFixed(1)}">${grade.huruf}</span>`;
                        semTotalQuality += (c.sks * grade.bobot_ipk);
                        semTotalSksDone += c.sks;
                        globalQuality += (c.sks * grade.bobot_ipk);
                        globalSksDone += c.sks;
                        gradeCounts[grade.huruf] = (gradeCounts[grade.huruf] || 0) + 1;
                    }
                }

                return `
                <div class="matkul-item" data-course-id="${c.id}" style="flex-direction: column; align-items: stretch; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div class="course-title-container" data-sks="${c.sks}">
                            <strong style="font-weight: 500;">${c.nama_matkul}</strong>
                            <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 0.5rem;">(${c.sks} SKS)</span>
                            ${finalGradeHTML}
                        </div>
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <select class="target-select">
                                <option value="">- Target -</option>
                                ${(gradingScales || []).map(s => `<option value="${s.id}" ${c.target_huruf_id === s.id ? 'selected' : ''}>${s.huruf}</option>`).join('')}
                            </select>
                            <button class="btn-delete-matkul" data-id="${c.id}" title="Delete Course" style="background:none; border:none; color: #ef4444; cursor: pointer; font-size: 1.2rem; opacity: 0.5;">&times;</button>
                        </div>
                    </div>
                    
                    <div class="matkul-details">
                        <div class="comp-list-container">${compsHTML}</div>
                        <button class="btn-add-comp" style="background: none; border: 1px dashed var(--border-color); color: var(--text-secondary); width: 100%; padding: 0.5rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; margin-top: 0.5rem; ${totalWeight >= 100 ? 'opacity: 0.4; pointer-events: none;' : ''}">${totalWeight >= 100 ? 'Max Weight Reached (100%)' : '+ Add Grading Component'}</button>
                        <div class="extortionist-panel">Adjust scores or targets to project your academic fate.</div>
                    </div>
                </div>
               `;
            }).join('') + `</div>`;

        const semSks = semCourses.reduce((sum, c) => sum + (c.sks || 0), 0);
        let ipsHTML = '';
        if (semTotalSksDone > 0) {
            const ips = semTotalQuality / semTotalSksDone;
            ipsHTML = `<span class="live-ips-badge" style="font-size: 0.8rem; font-weight: 500; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.15rem 0.6rem; border-radius: 12px; margin-left: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.2);">IPS: ${ips.toFixed(2)}</span>`;
        }
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 class="sem-title-container" style="font-size: 1.25rem; font-weight: 500; display: flex; align-items: center; cursor: pointer; user-select: none;">
                    ${sem.nama_semester}
                    <span style="font-size: 0.8rem; font-weight: 500; color: var(--accent-color); background: rgba(99, 102, 241, 0.1); padding: 0.15rem 0.6rem; border-radius: 12px; margin-left: 0.75rem; border: 1px solid rgba(99, 102, 241, 0.2);">${semSks} SKS</span>
                    ${ipsHTML}
                    <svg class="sem-chevron" style="width:20px; height:20px; margin-left: 0.5rem; transition: transform 0.3s; color: var(--text-secondary);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </h3>
                <button class="btn-delete-sem" data-id="${sem.id}" style="background:none; border:none; color: #ef4444; cursor: pointer; font-size: 0.85rem; opacity: 0.7;">Delete Semester</button>
            </div>
            <div class="sem-content-container">
                ${coursesHTML}
                <button class="btn btn-add-matkul" data-sem-id="${sem.id}" style="padding: 0.75rem 1rem; font-size: 0.85rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); width: auto; margin-top: 1rem;">+ Add Course</button>
            </div>
        `;
        listContainer.appendChild(card);
    });

    updateGlobalAcademicSummary();

    attachDashboardEvents(container, userId);
}

function attachDashboardEvents(container, userId) {
    // Toggle Semester
    container.querySelectorAll('.sem-title-container').forEach(title => {
        title.addEventListener('click', (e) => {
            const card = e.target.closest('.semester-card');
            if (card) card.classList.toggle('collapsed');
        });
    });

    // Expand Course
    container.querySelectorAll('.matkul-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.matkul-details') || e.target.closest('.target-select') || e.target.classList.contains('remove-btn') || e.target.classList.contains('btn-delete-matkul')) return;
            item.classList.toggle('expanded');
            runExtortionistEngine(item.getAttribute('data-course-id'));
        });
    });

    // Delete Semester
    container.querySelectorAll('.btn-delete-sem').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            e.target.innerText = '...';
            const { error } = await supabase.from('semesters').delete().eq('id', id);
            if (!error) { showNotification("Semester deleted", 'success'); loadSemesters(container, userId); }
        });
    });

    // Add Course
    container.querySelectorAll('.btn-add-matkul').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const semId = e.target.getAttribute('data-sem-id');
            showPrompt("Tambah Mata Kuliah", [
                { name: 'nama', placeholder: 'Course Name', type: 'text' },
                { name: 'sks', placeholder: 'Credits (SKS)', type: 'number' }
            ], async (results) => {
                if (!results.nama || !results.sks) return;
                const { error } = await supabase.from('courses').insert([{ semester_id: semId, nama_matkul: results.nama, sks: parseInt(results.sks) }]);
                if (error) showNotification("Failed to add course", 'error');
                else { showNotification("Course added successfully", 'success'); loadSemesters(container, userId); }
            });
        });
    });

    // Delete Course
    container.querySelectorAll('.btn-delete-matkul').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = e.target.getAttribute('data-id');
            e.target.innerText = '...';
            await supabase.from('courses').delete().eq('id', id);
            showNotification("Course deleted", 'success');
            loadSemesters(container, userId);
        });
    });

    // Add Component
    container.querySelectorAll('.btn-add-comp').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const originalText = e.target.innerText;
            e.target.innerText = 'Adding...';
            e.target.style.opacity = '0.5';
            
            const matkulItem = e.target.closest('.matkul-item');
            const courseId = matkulItem.getAttribute('data-course-id');

            const { error } = await supabase.from('grade_components').insert([{ course_id: courseId, nama_komponen: 'New Component', bobot_persen: 10 }]);
            if (!error) loadSemesters(container, userId).then(() => {
                const reItem = document.querySelector(`.matkul-item[data-course-id="${courseId}"]`);
                if (reItem) { reItem.classList.add('expanded'); runExtortionistEngine(courseId); }
            });
            else {
                e.target.innerText = originalText;
                e.target.style.opacity = '1';
            }
        });
    });

    // Handle target select change & input changes
    container.querySelectorAll('.target-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const courseId = e.target.closest('.matkul-item').getAttribute('data-course-id');
            await supabase.from('courses').update({ target_huruf_id: e.target.value || null }).eq('id', courseId);
            runExtortionistEngine(courseId);
        });
    });

    container.querySelectorAll('.comp-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const row = e.target.closest('.comp-row');
            const compId = row.getAttribute('data-comp-id');
            const courseId = row.closest('.matkul-item').getAttribute('data-course-id');

            const nama = row.querySelector('.input-nama').value;
            let bobot = parseFloat(row.querySelector('.input-bobot').value) || 0;
            
            let otherWeight = 0;
            row.closest('.matkul-item').querySelectorAll('.comp-row').forEach(r => {
                if (r !== row) {
                    otherWeight += (parseFloat(r.querySelector('.input-bobot').value) || 0);
                }
            });

            if (bobot < 0) bobot = 0;
            if (bobot + otherWeight > 100) {
                bobot = Math.max(0, 100 - otherWeight);
            }
            row.querySelector('.input-bobot').value = bobot;

            const scoreStr = row.querySelector('.input-score').value;
            let score = scoreStr === '' ? null : parseFloat(scoreStr);
            if (score !== null) {
                if (score < 0) score = 0;
                if (score > 100) score = 100;
                row.querySelector('.input-score').value = score;
            }

            await supabase.from('grade_components').update({ nama_komponen: nama, bobot_persen: bobot, nilai_diperoleh: score }).eq('id', compId);
            runExtortionistEngine(courseId);
        });
    });

    // Delete Component
    container.querySelectorAll('.btn-delete-comp').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const row = e.target.closest('.comp-row');
            const compId = row.getAttribute('data-comp-id');
            const courseId = row.closest('.matkul-item').getAttribute('data-course-id');
            
            row.style.opacity = '0.3';
            e.target.disabled = true;

            await supabase.from('grade_components').delete().eq('id', compId);
            row.remove();
            runExtortionistEngine(courseId);
        });
    });
}

async function runExtortionistEngine(courseId) {
    const scales = window.__gradingScales;
    const courseEl = document.querySelector(`.matkul-item[data-course-id="${courseId}"]`);
    if (!courseEl) return;

    const targetSelect = courseEl.querySelector('.target-select');
    const targetId = targetSelect.value;
    const panel = courseEl.querySelector('.extortionist-panel');

    const rows = courseEl.querySelectorAll('.comp-row');
    let totalWeight = 0;
    let currentScore = 0;
    let emptyWeight = 0;
    let emptyComponents = [];

    rows.forEach(row => {
        const name = row.querySelector('.input-nama').value || 'Component';
        const w = parseFloat(row.querySelector('.input-bobot').value) || 0;
        const sStr = row.querySelector('.input-score').value;
        totalWeight += w;
        if (sStr !== '') {
            currentScore += (parseFloat(sStr) * (w / 100));
        } else {
            emptyWeight += w;
            if (w > 0) emptyComponents.push(name);
        }
    });

    const btnAddComp = courseEl.querySelector('.btn-add-comp');
    if (btnAddComp) {
        if (totalWeight >= 100) {
            btnAddComp.style.opacity = '0.4';
            btnAddComp.style.pointerEvents = 'none';
            btnAddComp.innerText = 'Max Weight Reached (100%)';
        } else {
            btnAddComp.style.opacity = '1';
            btnAddComp.style.pointerEvents = 'auto';
            btnAddComp.innerText = '+ Add Grading Component';
        }
    }

    if (totalWeight > 100) {
        panel.innerHTML = `<span style="color:#ef4444; font-weight:500;">Warning: Total weight is ${totalWeight}%.</span> It must be exactly 100% to project grades accurately. Please adjust your component weights.`;
        return;
    }

    if (!targetId) {
        panel.innerHTML = `Set a target grade to start projecting your fate.`;
        return;
    }

    let targetScale = scales.find(s => s.id === targetId);
    const maxPossible = currentScore + emptyWeight;

    // Calculation Result
    if (emptyWeight > 0) {
        if (maxPossible < targetScale.batas_bawah) {
            const possibleScales = scales.filter(s => maxPossible >= s.batas_bawah);
            const names = emptyComponents.length > 0 ? emptyComponents.join(', ') : 'the remaining components';
            
            if (possibleScales.length > 0) {
                const newTarget = possibleScales[0];
                const needed = newTarget.batas_bawah - currentScore;
                const requiredAvg = Math.max(0, (needed * 100) / emptyWeight);
                
                panel.innerHTML = `Target <strong>${targetScale.huruf}</strong> is mathematically <span style="color:#ef4444; font-weight:500;">impossible</span>. Highest achievable grade is <strong>${newTarget.huruf}</strong>, requiring an average of <strong style="font-size:1.15rem; color:var(--text-primary);">${requiredAvg.toFixed(1)}</strong> on <strong>${names}</strong>.`;
            } else {
                panel.innerHTML = `Target <strong>${targetScale.huruf}</strong> is mathematically <span style="color:#ef4444; font-weight:500;">impossible</span>. Even with perfect scores, you cannot pass this course.`;
            }
        } else {
            const needed = targetScale.batas_bawah - currentScore;
            const requiredAvg = Math.max(0, (needed * 100) / emptyWeight);
            const names = emptyComponents.length > 0 ? emptyComponents.join(', ') : 'the remaining components';

            if (requiredAvg > 100) {
                panel.innerHTML = `You need an average of <strong style="color:#ef4444;">${requiredAvg.toFixed(1)}</strong> on <strong>${names}</strong> to get <strong>${targetScale.huruf}</strong>.`;
            } else {
                panel.innerHTML = `To achieve <strong>${targetScale.huruf}</strong>, <strong>${names}</strong> must average at least <strong style="font-size:1.15rem; color:var(--text-primary);">${requiredAvg.toFixed(1)}</strong>`;
            }
        }
    } else {
        const actualGrade = (scales || []).find(s => currentScore >= s.batas_bawah) || scales[scales.length - 1];
        if (actualGrade.id !== targetScale.id && actualGrade.batas_bawah > targetScale.batas_bawah) {
            panel.innerHTML = `Outstanding! You aimed for <strong>${targetScale.huruf}</strong> but overachieved and secured a <strong>${actualGrade.huruf}</strong>. Final Score: <strong style="color:var(--text-primary);">${currentScore.toFixed(1)}</strong>`;
        } else if (currentScore >= targetScale.batas_bawah) {
            panel.innerHTML = `Congratulations! Target <strong>${targetScale.huruf}</strong> is secured. Final Score: <strong style="color:var(--text-primary);">${currentScore.toFixed(1)}</strong>`;
        } else {
            panel.innerHTML = `Target <strong>${targetScale.huruf}</strong> failed to reach. You received a <strong>${actualGrade.huruf}</strong>. Final Score: <strong>${currentScore.toFixed(1)}</strong>`;
        }
    }

    // Dynamic Live UI Updates without refreshing page
    const courseTitleContainer = courseEl.querySelector('.course-title-container');
    if (courseTitleContainer) {
        const oldBadge = courseTitleContainer.querySelector('.live-grade-badge');
        if (emptyWeight === 0 && totalWeight > 0) {
            const actualGrade = (scales || []).find(s => currentScore >= s.batas_bawah) || scales[scales.length - 1];
            if (oldBadge) {
                oldBadge.innerText = actualGrade.huruf;
                oldBadge.setAttribute('data-huruf', actualGrade.huruf);
                oldBadge.setAttribute('data-bobot-ipk', actualGrade.bobot_ipk);
                oldBadge.title = `Final Score: ${currentScore.toFixed(1)}`;
            } else {
                const sks = parseFloat(courseTitleContainer.getAttribute('data-sks')) || 0;
                const newBadge = document.createElement('span');
                newBadge.className = 'live-grade-badge';
                newBadge.setAttribute('data-huruf', actualGrade.huruf);
                newBadge.setAttribute('data-bobot-ipk', actualGrade.bobot_ipk);
                newBadge.setAttribute('data-sks', sks);
                newBadge.title = `Final Score: ${currentScore.toFixed(1)}`;
                newBadge.style = "background: var(--text-primary); color: var(--bg-color); padding: 0.15rem 0.6rem; border-radius: 4px; font-weight: 600; font-size: 0.85rem; margin-left: 0.5rem;";
                newBadge.innerText = actualGrade.huruf;
                courseTitleContainer.appendChild(newBadge);
            }
        } else {
            if (oldBadge) oldBadge.remove();
        }
    }

    if (window.updateGlobalAcademicSummary) window.updateGlobalAcademicSummary();
}

// ---------------------------------------------------------
// Custom Utilities (Menggantikan alert/prompt bawaan browser)
// ---------------------------------------------------------

function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function showPrompt(title, fields, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';

    const modal = document.createElement('div');
    modal.className = 'modal card';

    let inputsHtml = fields.map(f => `
        <input type="${f.type}" id="prompt-${f.name}" placeholder="${f.placeholder}" style="margin-bottom: 1rem;" required>
    `).join('');

    modal.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; font-weight: 500;">${title}</h3>
        <form id="promptForm">
            ${inputsHtml}
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" id="promptCancel" class="btn" style="width: auto; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);">Batal</button>
                <button type="submit" class="btn btn-google" style="width: auto; background: var(--text-primary); color: white;">Simpan</button>
            </div>
        </form>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus first input
    setTimeout(() => {
        const firstInput = document.getElementById(`prompt-${fields[0].name}`);
        if (firstInput) firstInput.focus();
    }, 100);

    document.getElementById('promptCancel').addEventListener('click', () => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    });

    document.getElementById('promptForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const results = {};
        fields.forEach(f => {
            results[f.name] = document.getElementById(`prompt-${f.name}`).value;
        });
        callback(results);
        document.getElementById('promptCancel').click();
    });
}

window.updateGlobalAcademicSummary = function() {
    const scales = window.__gradingScales || [];
    let globalQuality = 0;
    let globalSksDone = 0;
    let gradeCounts = {};

    document.querySelectorAll('.semester-card').forEach(semCard => {
        let semQuality = 0;
        let semSksDone = 0;

        semCard.querySelectorAll('.live-grade-badge').forEach(badge => {
            const bobotIpk = parseFloat(badge.getAttribute('data-bobot-ipk')) || 0;
            const sks = parseFloat(badge.getAttribute('data-sks')) || 0;
            const huruf = badge.getAttribute('data-huruf');

            semQuality += (sks * bobotIpk);
            semSksDone += sks;
            globalQuality += (sks * bobotIpk);
            globalSksDone += sks;
            gradeCounts[huruf] = (gradeCounts[huruf] || 0) + 1;
        });

        const semTitleContainer = semCard.querySelector('.sem-title-container');
        if (semTitleContainer) {
            let oldIpsBadge = semTitleContainer.querySelector('.live-ips-badge');
            if (semSksDone > 0) {
                const ips = semQuality / semSksDone;
                if (!oldIpsBadge) {
                    oldIpsBadge = document.createElement('span');
                    oldIpsBadge.className = 'live-ips-badge';
                    oldIpsBadge.style = "font-size: 0.8rem; font-weight: 500; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.15rem 0.6rem; border-radius: 12px; margin-left: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.2);";
                    semTitleContainer.appendChild(oldIpsBadge);
                }
                oldIpsBadge.innerText = `IPS: ${ips.toFixed(2)}`;
            } else {
                if (oldIpsBadge) oldIpsBadge.remove();
            }
        }
    });

    const summaryContainer = document.getElementById('academicSummaryContainer');
    if (summaryContainer) {
        const totalSksBadge = document.getElementById('totalSksBadge');
        let totalSksAll = 0;
        if(totalSksBadge) {
            const match = totalSksBadge.innerText.match(/\d+/);
            if(match) totalSksAll = parseInt(match[0], 10);
        }

        let ipk = globalSksDone > 0 ? (globalQuality / globalSksDone).toFixed(2) : '0.00';
        window.__globalIpk = ipk;
        window.__globalSks = globalSksDone;
        let gradeStatsHtml = Object.entries(gradeCounts).sort((a,b) => b[1] - a[1]).map(([huruf, count]) => `<div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; text-align: center;"><strong style="font-size: 1.25rem; display: block; color: var(--text-primary);">${huruf}</strong><span style="color: var(--text-secondary); font-size: 0.8rem;">${count} subject(s)</span></div>`).join('');
        
        summaryContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); padding: 1.25rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--accent-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">Cumulative GPA</div>
                    <div style="font-size: 2.5rem; font-weight: 300; color: var(--text-primary); line-height: 1;">${ipk}</div>
                </div>
                <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">SKS Completed</div>
                    <div style="font-size: 2.5rem; font-weight: 300; color: var(--text-primary); line-height: 1;">${globalSksDone} <span style="font-size: 1.25rem; color: var(--text-secondary);">/ ${totalSksAll}</span></div>
                </div>
            </div>
            <h4 style="margin-bottom: 1rem; font-weight: 500; font-size: 1rem; color: var(--text-secondary);">Grade Distribution</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.75rem;">
                ${gradeStatsHtml || '<div style="color: var(--text-secondary); font-size: 0.9rem; grid-column: 1/-1; padding: 1rem; text-align: center; border: 1px dashed var(--border-color); border-radius: 8px;">No completed subjects yet.</div>'}
            </div>
        `;
    }
}

window.initSimulator = function() {
    if (window._simInitialized) return;
    window._simInitialized = true;
    
    const curIpkInput = document.getElementById('sim-current-ipk');
    const curSksInput = document.getElementById('sim-current-sks');
    
    // Auto fill
    curIpkInput.value = window.__globalIpk || '';
    curSksInput.value = window.__globalSks || '';

    const container = document.getElementById('sim-courses-container');
    const addBtn = document.getElementById('sim-add-course');
    const calcBtn = document.getElementById('sim-calculate-btn');
    const resultPanel = document.getElementById('sim-result-panel');
    const minGradeSelect = document.getElementById('sim-min-grade');

    // Populate min grade dropdown
    const globalScales = window.__gradingScales || [];
    minGradeSelect.innerHTML = globalScales.map(s => `<option value="${s.bobot_ipk}">${s.huruf} (>= ${s.bobot_ipk})</option>`).join('');
    // Try to set default to 'C' or closest to 2.0
    let cScale = globalScales.find(s => s.huruf.trim().toUpperCase() === 'C');
    if (!cScale) cScale = globalScales.find(s => s.huruf.toUpperCase().includes('C'));
    if (!cScale) cScale = globalScales.find(s => Math.abs(parseFloat(s.bobot_ipk) - 2.0) < 0.1);
    
    if (cScale) {
        minGradeSelect.value = cScale.bobot_ipk.toString();
    }

    let courseCount = 0;

    function addCourseRow() {
        courseCount++;
        const row = document.createElement('div');
        row.style = "display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;";
        row.innerHTML = `
            <input type="text" class="comp-input sim-c-name" value="Course ${courseCount}" style="flex: 2;">
            <input type="number" class="comp-input sim-c-sks" placeholder="SKS (e.g. 3)" style="flex: 1;" min="1" max="10">
            <button class="sim-remove-row" style="background:none; border:none; color:#ef4444; font-size:1.2rem; cursor:pointer;">&times;</button>
        `;
        row.querySelector('.sim-remove-row').onclick = () => row.remove();
        container.appendChild(row);
    }
    
    // Default 3 empty courses
    addCourseRow(); addCourseRow(); addCourseRow();
    
    addBtn.onclick = addCourseRow;

    calcBtn.onclick = () => {
        const currentIpk = parseFloat(curIpkInput.value) || 0;
        const currentSks = parseFloat(curSksInput.value) || 0;
        const targetIpk = parseFloat(document.getElementById('sim-target-ipk').value) || 0;
        
        if (targetIpk <= 0) {
            resultPanel.style.display = 'block';
            resultPanel.innerHTML = `<div class="toast error show" style="position:relative; transform:none; bottom:0; right:0;">Please enter your Target Final GPA.</div>`;
            return;
        }

        const remainingCourses = [];
        container.querySelectorAll('div').forEach(row => {
            const name = row.querySelector('.sim-c-name').value;
            const sks = parseFloat(row.querySelector('.sim-c-sks').value) || 0;
            if (sks > 0) remainingCourses.push({ name, sks });
        });

        if (remainingCourses.length === 0) {
            resultPanel.style.display = 'block';
            resultPanel.innerHTML = `<div class="toast error show" style="position:relative; transform:none; bottom:0; right:0;">Add at least 1 remaining course with its SKS.</div>`;
            return;
        }

        let scales = [...(window.__gradingScales || [])].sort((a, b) => b.bobot_ipk - a.bobot_ipk);
        if (scales.length === 0) return;
        
        const minGradeBobot = parseFloat(minGradeSelect.value) || 0;
        scales = scales.filter(s => s.bobot_ipk >= minGradeBobot);
        if (scales.length === 0) scales = [...(window.__gradingScales || [])].sort((a, b) => b.bobot_ipk - a.bobot_ipk); // fallback

        const maxIpkScale = scales[0].bobot_ipk;
        const minIpkScale = scales[scales.length - 1]; // The selected minimum grade
        
        const remainingSks = remainingCourses.reduce((sum, c) => sum + c.sks, 0);
        const totalSks = currentSks + remainingSks;
        
        const targetQuality = targetIpk * totalSks;
        const currentQuality = currentIpk * currentSks;
        const neededQuality = targetQuality - currentQuality;

        resultPanel.style.display = 'block';

        if (neededQuality <= remainingSks * minIpkScale.bobot_ipk) {
            resultPanel.innerHTML = `<div class="card" style="border: 2px solid #10b981; background: rgba(16,185,129,0.05);">
                <h3 style="color:#10b981; margin-bottom: 0.5rem;">Target Already Achieved! 🎉</h3>
                <p>Even if you get the minimum accepted grade (<strong>${minIpkScale.huruf}</strong>) in all remaining courses, your GPA will not drop below the target.</p>
            </div>`;
            return;
        }

        if (neededQuality > remainingSks * maxIpkScale) {
            let maxPossibleGpa = (currentQuality + (remainingSks * maxIpkScale)) / totalSks;
            let displayMax = maxPossibleGpa.toFixed(2);
            if (parseFloat(displayMax) >= targetIpk) {
                displayMax = maxPossibleGpa.toFixed(4);
            }
            resultPanel.innerHTML = `<div class="card" style="border: 2px solid #ef4444; background: rgba(239,68,68,0.05);">
                <h3 style="color:#ef4444; margin-bottom: 0.5rem;">Mathematically Impossible 💀</h3>
                <p>Even if you get a <strong>${scales[0].huruf}</strong> in all remaining courses, you can only reach a maximum GPA of <strong>${displayMax}</strong>.</p>
            </div>`;
            return;
        }

        // Backtracking to find MULTIPLE combinations
        remainingCourses.sort((a,b) => b.sks - a.sks);
        
        // Sort scales ascending (lowest grade first) so DFS finds the easiest combinations first!
        scales.sort((a, b) => a.bobot_ipk - b.bobot_ipk);
        // maxIpkScale is now at the end, so we need to redefine it for the pruning logic
        const maxScaleBobot = scales[scales.length - 1].bobot_ipk;

        let validCombos = [];
        let iterations = 0;
        const MAX_ITER = 50000;

        function dfs(index, currentSum, combo) {
            if (iterations > MAX_ITER || validCombos.length >= 100) return;
            iterations++;
            
            if (index === remainingCourses.length) {
                if (currentSum >= neededQuality) {
                    validCombos.push({
                        combo: [...combo],
                        sum: currentSum
                    });
                }
                return;
            }

            // Pruning: if even with max grades we can't reach needed
            let maxRemaining = 0;
            for(let i = index; i < remainingCourses.length; i++) {
                maxRemaining += remainingCourses[i].sks * maxScaleBobot;
            }
            if (currentSum + maxRemaining < neededQuality) return;

            // Try all scales from lowest to highest
            for (let i = 0; i < scales.length; i++) {
                combo.push(scales[i]);
                dfs(index + 1, currentSum + (remainingCourses[index].sks * scales[i].bobot_ipk), combo);
                combo.pop();
            }
        }

        calcBtn.innerText = "Calculating Fate...";
        setTimeout(() => {
            dfs(0, 0, []);
            calcBtn.innerText = "Simulate My Fate";
            
            if (validCombos.length > 0) {
                // Sort by sum ascending to get the absolute minimum effort ones first
                validCombos.sort((a, b) => a.sum - b.sum);
                
                // Deduplicate combinations that result in identical grade assignments (if any)
                let uniqueCombos = [];
                let seen = new Set();
                for (let c of validCombos) {
                    let sig = c.combo.map(g => g.id).join(',');
                    if (!seen.has(sig)) {
                        seen.add(sig);
                        uniqueCombos.push(c);
                    }
                }
                
                // Take top 3 strategies
                let topStrategies = uniqueCombos.slice(0, 3);
                
                let html = `<div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-primary); font-weight: 500; font-size: 1.25rem;">Alternative Strategies 🎯</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Here are the ${topStrategies.length} best (easiest) ways to achieve your target GPA of <strong>${targetIpk.toFixed(2)}</strong>:</p>
                </div>`;
                
                let stratGrid = `<div style="display: flex; flex-direction: column; gap: 1.5rem;">`;
                
                topStrategies.forEach((strat, index) => {
                    let stratTitle = index === 0 ? "Option 1: The Bare Minimum" : (index === 1 ? "Option 2: Safe Buffer" : "Option 3: Alternative Mix");
                    if (strat.sum === topStrategies[0].sum) {
                        stratTitle = `Option ${index + 1}: Minimum Effort`;
                    }
                    
                    let stratHtml = `<div class="card" style="border: 1px solid var(--border-color); background: var(--surface-color); padding: 1.5rem;">
                        <h4 style="margin-bottom: 1rem; color: var(--accent-color); font-weight: 600;">${stratTitle}</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">`;
                    
                    let actualFinalQuality = currentQuality;
                    strat.combo.forEach((grade, i) => {
                        actualFinalQuality += remainingCourses[i].sks * grade.bobot_ipk;
                        stratHtml += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1rem; background: var(--bg-color); border-radius: 6px; border: 1px solid rgba(0,0,0,0.05);">
                            <span style="font-size:0.9rem;"><strong>${remainingCourses[i].name}</strong> <span style="color:var(--text-secondary);">(${remainingCourses[i].sks} SKS)</span></span>
                            <span style="font-weight: 600; background: var(--text-primary); color: var(--bg-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem;">${grade.huruf}</span>
                        </div>`;
                    });
                    
                    const finalIpk = actualFinalQuality / totalSks;
                    stratHtml += `</div>
                        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">Final Projected GPA:</span>
                            <strong style="font-size: 1.25rem; color: var(--text-primary);">${finalIpk.toFixed(2)}</strong>
                        </div>
                    </div>`;
                    stratGrid += stratHtml;
                });
                
                stratGrid += `</div>`;
                resultPanel.innerHTML = html + stratGrid;
            } else {
                resultPanel.innerHTML = `<div class="toast error show" style="position:relative; transform:none; bottom:0; right:0;">Mathematically impossible to reach target with current constraints.</div>`;
            }
        }, 50);
    };
};
