// Global app state
let APP_STATE = {
    currentTab: 'dashboard',
    studies: [],
    disciplines: [],
    settings: {
        dailyGoal: 3,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
    },
    timer: {
        seconds: 0,
        isRunning: false,
        interval: null
    },
    charts: {}
};

// Initial data
const INITIAL_DATA = {
    studies: [
        {
            id: 1696435200001,
            discipline: "1",
            topic: "Arritmias",
            correctAnswers: 18,
            totalQuestions: 20,
            percentage: 90,
            studyDate: "2024-09-28",
            studyTime: 1800,
            observations: "Revisão de conceitos básicos",
            createdAt: "2024-09-28T10:30:00.000Z",
            nextReview: "2024-09-29"
        },
        {
            id: 1696435200002,
            discipline: "2",
            topic: "Asma",
            correctAnswers: 15,
            totalQuestions: 20,
            percentage: 75,
            studyDate: "2024-09-29",
            studyTime: 2100,
            observations: "Foco em diagnóstico diferencial",
            createdAt: "2024-09-29T14:15:00.000Z",
            nextReview: "2024-09-30"
        },
        {
            id: 1696435200003,
            discipline: "4",
            topic: "AVC",
            correctAnswers: 12,
            totalQuestions: 20,
            percentage: 60,
            studyDate: "2024-09-30",
            studyTime: 2700,
            observations: "Preciso estudar mais sobre tratamento",
            createdAt: "2024-09-30T09:20:00.000Z",
            nextReview: "2024-10-01"
        }
    ],
    disciplines: [
        {
            id: 1,
            nome: "Cardiologia",
            assuntos: ["Arritmias", "Insuficiência Cardíaca", "Coronariopatias", "Hipertensão", "Valvopatias"],
            isCustom: false
        },
        {
            id: 2,
            nome: "Pneumologia",
            assuntos: ["Asma", "DPOC", "Pneumonias", "Derrame Pleural", "Embolia Pulmonar"],
            isCustom: false
        },
        {
            id: 3,
            nome: "Gastroenterologia",
            assuntos: ["DRGE", "Úlcera Péptica", "Hepatites", "Cirrose", "Pancreatite"],
            isCustom: false
        },
        {
            id: 4,
            nome: "Neurologia",
            assuntos: ["AVC", "Epilepsia", "Cefaléias", "Demências", "Parkinson"],
            isCustom: false
        },
        {
            id: 5,
            nome: "Endocrinologia",
            assuntos: ["Diabetes", "Tireoidopatias", "Obesidade", "Osteoporose", "Adrenal"],
            isCustom: false
        }
    ],
    settings: {
        dailyGoal: 3,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
    }
};

// Utility functions
const safeGetElement = (selector) => {
    try {
        return document.querySelector(selector) || document.getElementById(selector);
    } catch (e) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
};

const formatDate = (date) => {
    try {
        return new Date(date).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
};

const formatTime = (seconds) => {
    try {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } catch (e) {
        return '00:00:00';
    }
};

const formatDuration = (seconds) => {
    try {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
    } catch (e) {
        return '0min';
    }
};

const getDisciplineName = (disciplineId) => {
    try {
        const discipline = APP_STATE.disciplines.find(d => d.id == disciplineId);
        return discipline ? discipline.nome : 'Disciplina não encontrada';
    } catch (e) {
        return 'Erro ao buscar disciplina';
    }
};

const isDateToday = (date) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        return date === today;
    } catch (e) {
        return false;
    }
};

const isDateOverdue = (date) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        return date < today;
    } catch (e) {
        return false;
    }
};

// SM-2 Algorithm for spaced repetition
const calculateNextReview = (performance, currentInterval = 1) => {
    try {
        let newInterval = currentInterval;
        
        if (performance >= 80) {
            newInterval = Math.max(1, Math.round(currentInterval * 2.5));
        } else if (performance >= 60) {
            newInterval = Math.max(1, Math.round(currentInterval * 1.3));
        } else {
            newInterval = Math.max(1, Math.round(currentInterval * 0.6));
        }
        
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
        
        return {
            nextReview: nextReviewDate.toISOString().split('T')[0],
            interval: newInterval
        };
    } catch (e) {
        console.error('Error calculating next review:', e);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return {
            nextReview: tomorrow.toISOString().split('T')[0],
            interval: 1
        };
    }
};

// Storage functions
const saveData = () => {
    try {
        const data = {
            studies: APP_STATE.studies,
            disciplines: APP_STATE.disciplines,
            settings: APP_STATE.settings
        };
        localStorage.setItem('medStudyApp', JSON.stringify(data));
        console.log('Data saved successfully');
    } catch (e) {
        console.error('Error saving data:', e);
        showToast('Erro ao salvar dados', 'error');
    }
};

const loadData = () => {
    try {
        const saved = localStorage.getItem('medStudyApp');
        if (saved) {
            const data = JSON.parse(saved);
            APP_STATE.studies = data.studies || INITIAL_DATA.studies;
            APP_STATE.disciplines = data.disciplines || INITIAL_DATA.disciplines;
            APP_STATE.settings = { ...INITIAL_DATA.settings, ...(data.settings || {}) };
        } else {
            APP_STATE.studies = [...INITIAL_DATA.studies];
            APP_STATE.disciplines = [...INITIAL_DATA.disciplines];
            APP_STATE.settings = { ...INITIAL_DATA.settings };
            saveData();
        }
        
        // Calculate current streak
        APP_STATE.settings.currentStreak = calculateStreak();
        if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
            APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
        }
        console.log('Data loaded successfully');
    } catch (e) {
        console.error('Error loading data:', e);
        // Fallback to initial data
        APP_STATE.studies = [...INITIAL_DATA.studies];
        APP_STATE.disciplines = [...INITIAL_DATA.disciplines];
        APP_STATE.settings = { ...INITIAL_DATA.settings };
    }
};

const calculateStreak = () => {
    try {
        const uniqueDates = [...new Set(APP_STATE.studies.map(s => s.studyDate))].sort().reverse();
        if (uniqueDates.length === 0) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let currentDate = today;
        
        for (const studyDate of uniqueDates) {
            if (studyDate === currentDate) {
                streak++;
                const prevDate = new Date(currentDate);
                prevDate.setDate(prevDate.getDate() - 1);
                currentDate = prevDate.toISOString().split('T')[0];
            } else if (studyDate < currentDate) {
                const daysDiff = Math.floor((new Date(currentDate) - new Date(studyDate)) / (1000 * 60 * 60 * 24));
                if (daysDiff === 1) {
                    streak++;
                    currentDate = studyDate;
                    const prevDate = new Date(currentDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    currentDate = prevDate.toISOString().split('T')[0];
                } else {
                    break;
                }
            }
        }
        
        return streak;
    } catch (e) {
        console.error('Error calculating streak:', e);
        return 0;
    }
};

// Toast system
const showToast = (message, type = 'info') => {
    try {
        const container = safeGetElement('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-message">${message}</div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('toast--show'), 100);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
        
        console.log(`Toast: ${type} - ${message}`);
    } catch (e) {
        console.error('Error showing toast:', e);
    }
};

// Copy to clipboard (works in APK too)
const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (err) {
        console.error('Copy failed:', err);
        return false;
    }
};

// MAIN FEATURE: Mark review as complete
const markReviewComplete = (studyId) => {
    try {
        console.log('Marking review complete for study ID:', studyId);
        const study = APP_STATE.studies.find(s => s.id === studyId);
        if (!study) {
            console.error('Study not found:', studyId);
            showToast('Estudo não encontrado', 'error');
            return;
        }
        
        const nextReviewData = calculateNextReview(study.percentage);
        study.nextReview = nextReviewData.nextReview;
        
        saveData();
        
        showToast(`Revisão de ${study.topic} marcada como concluída! Próxima revisão: ${formatDate(study.nextReview)}`, 'success');
        
        // Update displays
        updateDashboardStats();
        renderReviewLists();
        
        console.log('Review marked complete successfully');
    } catch (e) {
        console.error('Error marking review complete:', e);
        showToast('Erro ao marcar revisão como concluída', 'error');
    }
};

// Timer functions
const updateTimerDisplay = () => {
    try {
        const display = safeGetElement('timer-display');
        if (display) {
            display.textContent = formatTime(APP_STATE.timer.seconds);
        }
    } catch (e) {
        console.error('Error updating timer display:', e);
    }
};

const startTimer = () => {
    try {
        if (!APP_STATE.timer.isRunning) {
            APP_STATE.timer.isRunning = true;
            APP_STATE.timer.interval = setInterval(() => {
                APP_STATE.timer.seconds++;
                updateTimerDisplay();
            }, 1000);
            
            const startBtn = safeGetElement('timer-start');
            const pauseBtn = safeGetElement('timer-pause');
            const stopBtn = safeGetElement('timer-stop');
            
            if (startBtn) startBtn.disabled = true;
            if (pauseBtn) pauseBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = false;
        }
    } catch (e) {
        console.error('Error starting timer:', e);
    }
};

const pauseTimer = () => {
    try {
        if (APP_STATE.timer.isRunning) {
            clearInterval(APP_STATE.timer.interval);
            APP_STATE.timer.isRunning = false;
            
            const startBtn = safeGetElement('timer-start');
            const pauseBtn = safeGetElement('timer-pause');
            
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
        }
    } catch (e) {
        console.error('Error pausing timer:', e);
    }
};

const stopTimer = () => {
    try {
        clearInterval(APP_STATE.timer.interval);
        APP_STATE.timer.isRunning = false;
        
        // Set study time in form
        const studyTimeInput = safeGetElement('study-time-manual');
        if (studyTimeInput) {
            studyTimeInput.value = Math.ceil(APP_STATE.timer.seconds / 60);
        }
        
        const startBtn = safeGetElement('timer-start');
        const pauseBtn = safeGetElement('timer-pause');
        const stopBtn = safeGetElement('timer-stop');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
        
        showToast(`Tempo registrado: ${formatDuration(APP_STATE.timer.seconds)}`, 'info');
    } catch (e) {
        console.error('Error stopping timer:', e);
    }
};

const resetTimer = () => {
    try {
        clearInterval(APP_STATE.timer.interval);
        APP_STATE.timer.seconds = 0;
        APP_STATE.timer.isRunning = false;
        updateTimerDisplay();
        
        const startBtn = safeGetElement('timer-start');
        const pauseBtn = safeGetElement('timer-pause');
        const stopBtn = safeGetElement('timer-stop');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
    } catch (e) {
        console.error('Error resetting timer:', e);
    }
};

// Navigation system
const initNavigation = () => {
    try {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        console.log('Navigation buttons found:', navButtons.length);
        console.log('Tab contents found:', tabContents.length);
        
        navButtons.forEach((btn, index) => {
            console.log(`Setting up navigation for button ${index}: ${btn.dataset.tab}`);
            btn.addEventListener('click', (e) => {
                try {
                    const targetTab = btn.dataset.tab;
                    console.log('Switching to tab:', targetTab);
                    
                    // Update button states
                    navButtons.forEach(b => b.classList.remove('nav-btn--active'));
                    btn.classList.add('nav-btn--active');
                    
                    // Update tab content
                    tabContents.forEach(tab => {
                        tab.classList.remove('tab-content--active');
                        if (tab.dataset.tab === targetTab) {
                            tab.classList.add('tab-content--active');
                        }
                    });
                    
                    APP_STATE.currentTab = targetTab;
                    
                    // Initialize specific tab content
                    switch (targetTab) {
                        case 'dashboard':
                            updateDashboard();
                            break;
                        case 'cadastro':
                            // Re-initialize form when switching to this tab
                            setupStudyForm();
                            break;
                        case 'revisoes':
                            renderReviewLists();
                            break;
                        case 'historico':
                            renderStudiesHistory();
                            break;
                        case 'configuracoes':
                            renderDisciplinesList();
                            updateSettingsForm();
                            break;
                    }
                    
                    console.log('Tab switched successfully to:', targetTab);
                } catch (e) {
                    console.error('Error switching tabs:', e);
                }
            });
        });
        
        console.log('Navigation initialized successfully');
    } catch (e) {
        console.error('Error initializing navigation:', e);
    }
};

// Dashboard functions
const updateDashboardStats = () => {
    try {
        const totalStudies = APP_STATE.studies.length;
        const today = new Date().toISOString().split('T')[0];
        
        const overdueReviews = APP_STATE.studies.filter(s => isDateOverdue(s.nextReview)).length;
        const todayReviews = APP_STATE.studies.filter(s => isDateToday(s.nextReview)).length;
        
        const avgPerformance = totalStudies > 0 
            ? Math.round(APP_STATE.studies.reduce((sum, s) => sum + s.percentage, 0) / totalStudies)
            : 0;
        
        const totalTime = APP_STATE.studies.reduce((sum, s) => sum + (s.studyTime || 0), 0);
        const avgTime = totalStudies > 0 ? Math.round(totalTime / totalStudies / 60) : 0;
        
        // Update daily goal progress
        const todayStudies = APP_STATE.studies.filter(s => s.studyDate === today).length;
        const goalProgress = Math.min((todayStudies / APP_STATE.settings.dailyGoal) * 100, 100);
        
        // Safe update elements
        const updateElement = (id, value) => {
            const el = safeGetElement(id);
            if (el) el.textContent = value;
        };
        
        updateElement('total-studies', totalStudies);
        updateElement('overdue-reviews', overdueReviews);
        updateElement('today-reviews', todayReviews);
        updateElement('avg-performance', `${avgPerformance}%`);
        updateElement('total-time', formatDuration(totalTime));
        updateElement('avg-time', `${avgTime}min`);
        
        updateElement('daily-goal-text', `${todayStudies} / ${APP_STATE.settings.dailyGoal} estudos`);
        updateElement('current-streak', APP_STATE.settings.currentStreak);
        updateElement('longest-streak', APP_STATE.settings.longestStreak);
        
        const progressFill = safeGetElement('daily-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${goalProgress}%`;
        }
        
        console.log('Dashboard stats updated');
    } catch (e) {
        console.error('Error updating dashboard stats:', e);
    }
};

const updateDashboard = () => {
    try {
        updateDashboardStats();
        renderDisciplinesChart();
        renderPerformanceChart();
        renderActivityHeatmap();
        renderStreakChart();
        console.log('Dashboard updated successfully');
    } catch (e) {
        console.error('Error updating dashboard:', e);
    }
};

// Chart rendering functions
const renderDisciplinesChart = () => {
    try {
        const canvas = safeGetElement('disciplines-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (APP_STATE.charts.disciplines) {
            APP_STATE.charts.disciplines.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        const disciplineCounts = {};
        APP_STATE.studies.forEach(study => {
            const disciplineName = getDisciplineName(study.discipline);
            disciplineCounts[disciplineName] = (disciplineCounts[disciplineName] || 0) + 1;
        });
        
        const labels = Object.keys(disciplineCounts);
        const data = Object.values(disciplineCounts);
        
        if (labels.length === 0) {
            labels.push('Nenhum estudo');
            data.push(1);
        }
        
        APP_STATE.charts.disciplines = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        console.log('Disciplines chart rendered');
    } catch (e) {
        console.error('Error rendering disciplines chart:', e);
    }
};

const renderPerformanceChart = () => {
    try {
        const canvas = safeGetElement('performance-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (APP_STATE.charts.performance) {
            APP_STATE.charts.performance.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        const sortedStudies = [...APP_STATE.studies].sort((a, b) => new Date(a.studyDate) - new Date(b.studyDate));
        
        const labels = sortedStudies.map(s => formatDate(s.studyDate));
        const data = sortedStudies.map(s => s.percentage);
        
        if (labels.length === 0) {
            labels.push('Sem dados');
            data.push(0);
        }
        
        APP_STATE.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance (%)',
                    data: data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        console.log('Performance chart rendered');
    } catch (e) {
        console.error('Error rendering performance chart:', e);
    }
};

const renderActivityHeatmap = () => {
    try {
        const container = safeGetElement('activity-heatmap');
        if (!container) return;
        
        container.innerHTML = '';
        
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        
        const studyCountByDate = {};
        APP_STATE.studies.forEach(study => {
            const date = study.studyDate;
            studyCountByDate[date] = (studyCountByDate[date] || 0) + 1;
        });
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const count = studyCountByDate[dateStr] || 0;
            
            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 4) level = 3;
            
            const dayElement = document.createElement('div');
            dayElement.className = `heatmap-day heatmap-day--level-${level}`;
            dayElement.innerHTML = `<div class="heatmap-tooltip">${formatDate(dateStr)}: ${count} estudos</div>`;
            
            container.appendChild(dayElement);
        }
        
        console.log('Activity heatmap rendered');
    } catch (e) {
        console.error('Error rendering activity heatmap:', e);
    }
};

const renderStreakChart = () => {
    try {
        const canvas = safeGetElement('streak-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (APP_STATE.charts.streak) {
            APP_STATE.charts.streak.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        
        // Simple streak data for last 7 days
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const hasStudy = APP_STATE.studies.some(s => s.studyDate === dateStr);
            
            labels.push(date.getDate().toString());
            data.push(hasStudy ? 1 : 0);
        }
        
        APP_STATE.charts.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estudos',
                    data: data,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        console.log('Streak chart rendered');
    } catch (e) {
        console.error('Error rendering streak chart:', e);
    }
};

// FIXED: Form functions with proper event handling
const populateDisciplineSelect = () => {
    try {
        const select = safeGetElement('discipline');
        if (!select) {
            console.warn('Discipline select not found');
            return;
        }
        
        // Clear existing options
        select.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        APP_STATE.disciplines.forEach(discipline => {
            const option = document.createElement('option');
            option.value = discipline.id.toString();
            option.textContent = discipline.nome;
            select.appendChild(option);
        });
        
        console.log('Discipline select populated with', APP_STATE.disciplines.length, 'disciplines');
    } catch (e) {
        console.error('Error populating discipline select:', e);
    }
};

const populateTopicSelect = (disciplineId) => {
    try {
        const select = safeGetElement('topic');
        if (!select) {
            console.warn('Topic select not found');
            return;
        }
        
        console.log('Populating topics for discipline ID:', disciplineId);
        
        if (!disciplineId) {
            select.innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
            return;
        }
        
        // Convert to number for comparison
        const discipline = APP_STATE.disciplines.find(d => d.id === parseInt(disciplineId));
        console.log('Found discipline:', discipline);
        
        if (discipline && discipline.assuntos && discipline.assuntos.length > 0) {
            select.innerHTML = '<option value="">Selecione um tópico</option>';
            
            discipline.assuntos.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                select.appendChild(option);
            });
            
            console.log('Topic select populated with', discipline.assuntos.length, 'topics');
        } else {
            select.innerHTML = '<option value="">Nenhum tópico encontrado</option>';
            console.log('No discipline found or no topics available');
        }
    } catch (e) {
        console.error('Error populating topic select:', e);
    }
};

const setupStudyForm = () => {
    try {
        console.log('Setting up study form...');
        
        // Get form elements
        const form = safeGetElement('study-form');
        const disciplineSelect = safeGetElement('discipline');
        const topicSelect = safeGetElement('topic');
        const studyDateInput = safeGetElement('study-date');
        const totalQuestionsInput = safeGetElement('total-questions');
        const correctAnswersInput = safeGetElement('correct-answers');
        
        if (!form) {
            console.warn('Study form not found');
            return;
        }
        
        // Set today's date
        if (studyDateInput) {
            studyDateInput.valueAsDate = new Date();
        }
        
        // Populate discipline select
        populateDisciplineSelect();
        
        // FIXED: Remove any existing event listeners and add new ones
        if (disciplineSelect) {
            // Clone the element to remove all existing event listeners
            const newDisciplineSelect = disciplineSelect.cloneNode(true);
            disciplineSelect.parentNode.replaceChild(newDisciplineSelect, disciplineSelect);
            
            // Add new event listener
            newDisciplineSelect.addEventListener('change', function(e) {
                const selectedValue = e.target.value;
                console.log('Discipline changed to:', selectedValue);
                console.log('Selected discipline element:', e.target);
                
                // Update topic select
                populateTopicSelect(selectedValue);
                
                // Show visual feedback
                if (selectedValue) {
                    showToast(`Disciplina selecionada: ${getDisciplineName(selectedValue)}`, 'info');
                }
            });
            
            console.log('Discipline select event listener attached');
        }
        
        // Validation for answers
        if (totalQuestionsInput && correctAnswersInput) {
            const validateAnswers = () => {
                const totalQuestions = parseInt(totalQuestionsInput.value);
                const correctAnswers = parseInt(correctAnswersInput.value);
                
                if (!isNaN(totalQuestions) && !isNaN(correctAnswers) && correctAnswers > totalQuestions) {
                    correctAnswersInput.value = totalQuestions;
                    showToast('Questões corretas não pode ser maior que o total de questões', 'warning');
                }
            };
            
            totalQuestionsInput.addEventListener('blur', validateAnswers);
            correctAnswersInput.addEventListener('blur', validateAnswers);
        }
        
        console.log('Study form setup completed');
    } catch (e) {
        console.error('Error setting up study form:', e);
    }
};

const initStudyForm = () => {
    try {
        const form = safeGetElement('study-form');
        if (!form) return;
        
        // Handle form submission
        form.addEventListener('submit', handleStudyFormSubmit);
        
        // Initial setup
        setupStudyForm();
        
        console.log('Study form initialized');
    } catch (e) {
        console.error('Error initializing study form:', e);
    }
};

const handleStudyFormSubmit = (e) => {
    try {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const totalQuestions = parseInt(formData.get('totalQuestions'));
        const correctAnswers = parseInt(formData.get('correctAnswers'));
        const disciplineId = formData.get('discipline');
        const topic = formData.get('topic');
        
        // Validation
        if (!disciplineId) {
            showToast('Por favor, selecione uma disciplina', 'error');
            return;
        }
        
        if (!topic) {
            showToast('Por favor, selecione um tópico', 'error');
            return;
        }
        
        if (correctAnswers > totalQuestions) {
            showToast('Questões corretas não pode ser maior que o total', 'error');
            return;
        }
        
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const studyTime = parseInt(formData.get('studyTime')) * 60 || 0; // Convert to seconds
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);
        
        const study = {
            id: Date.now(),
            discipline: disciplineId,
            topic: topic,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            percentage: percentage,
            studyDate: formData.get('studyDate'),
            studyTime: studyTime,
            observations: formData.get('observations') || '',
            createdAt: new Date().toISOString(),
            nextReview: nextReview.toISOString().split('T')[0]
        };
        
        APP_STATE.studies.push(study);
        
        // Update streak
        APP_STATE.settings.currentStreak = calculateStreak();
        if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
            APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
        }
        
        saveData();
        
        showToast('Estudo cadastrado com sucesso!', 'success');
        
        // Reset form
        e.target.reset();
        if (safeGetElement('study-date')) {
            safeGetElement('study-date').valueAsDate = new Date();
        }
        
        // Reset selects
        populateDisciplineSelect();
        const topicSelect = safeGetElement('topic');
        if (topicSelect) {
            topicSelect.innerHTML = '<option value="">Selecione primeiro uma disciplina</option>';
        }
        
        // Reset timer
        resetTimer();
        
        // Update dashboard
        updateDashboardStats();
        
        console.log('Study submitted successfully');
    } catch (e) {
        console.error('Error submitting study:', e);
        showToast('Erro ao cadastrar estudo', 'error');
    }
};

// Reviews functions
const renderReviewLists = () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const overdueReviews = APP_STATE.studies.filter(s => isDateOverdue(s.nextReview));
        const todayReviews = APP_STATE.studies.filter(s => isDateToday(s.nextReview));
        const upcomingReviews = APP_STATE.studies.filter(s => s.nextReview > today);
        
        renderReviewList('overdue-reviews-list', overdueReviews, 'Nenhuma revisão atrasada');
        renderReviewList('today-reviews-list', todayReviews, 'Nenhuma revisão para hoje');
        renderReviewList('upcoming-reviews-list', upcomingReviews, 'Nenhuma revisão próxima');
        
        console.log('Review lists rendered');
    } catch (e) {
        console.error('Error rendering review lists:', e);
    }
};

const renderReviewList = (containerId, reviews, emptyMessage) => {
    try {
        const container = safeGetElement(containerId);
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>${emptyMessage}</h3></div>`;
            return;
        }
        
        container.innerHTML = reviews.map(study => {
            const disciplineName = getDisciplineName(study.discipline);
            let performanceClass = 'review-performance--good';
            if (study.percentage < 80) performanceClass = 'review-performance--average';
            if (study.percentage < 60) performanceClass = 'review-performance--poor';
            
            return `
                <div class="review-item">
                    <div class="review-info">
                        <h4>${study.topic}</h4>
                        <div class="review-meta">
                            <span><strong>Disciplina:</strong> ${disciplineName}</span>
                            <span><strong>Data do estudo:</strong> ${formatDate(study.studyDate)}</span>
                            <span><strong>Revisão:</strong> ${formatDate(study.nextReview)}</span>
                        </div>
                        <div class="review-performance ${performanceClass}">
                            Performance anterior: ${study.percentage}%
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="btn-review-done" onclick="markReviewComplete(${study.id})">
                            Revisão Feita
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Error rendering review list:', e);
    }
};

// History functions
const initHistoryFilters = () => {
    try {
        const disciplineFilter = safeGetElement('history-discipline-filter');
        const searchInput = safeGetElement('history-search');
        const dateFromInput = safeGetElement('date-from');
        const dateToInput = safeGetElement('date-to');
        const performanceFilter = safeGetElement('performance-filter');
        const clearFiltersBtn = safeGetElement('clear-filters');
        
        // Populate discipline filter
        if (disciplineFilter) {
            disciplineFilter.innerHTML = '<option value="">Todas as disciplinas</option>';
            APP_STATE.disciplines.forEach(discipline => {
                const option = document.createElement('option');
                option.value = discipline.id;
                option.textContent = discipline.nome;
                disciplineFilter.appendChild(option);
            });
        }
        
        // Add event listeners
        if (searchInput) searchInput.addEventListener('input', renderStudiesHistory);
        if (disciplineFilter) disciplineFilter.addEventListener('change', renderStudiesHistory);
        if (dateFromInput) dateFromInput.addEventListener('change', renderStudiesHistory);
        if (dateToInput) dateToInput.addEventListener('change', renderStudiesHistory);
        if (performanceFilter) performanceFilter.addEventListener('change', renderStudiesHistory);
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (disciplineFilter) disciplineFilter.value = '';
                if (dateFromInput) dateFromInput.value = '';
                if (dateToInput) dateToInput.value = '';
                if (performanceFilter) performanceFilter.value = '';
                renderStudiesHistory();
            });
        }
        
        console.log('History filters initialized');
    } catch (e) {
        console.error('Error initializing history filters:', e);
    }
};

const renderStudiesHistory = () => {
    try {
        const searchInput = safeGetElement('history-search');
        const disciplineFilter = safeGetElement('history-discipline-filter');
        const dateFromInput = safeGetElement('date-from');
        const dateToInput = safeGetElement('date-to');
        const performanceFilter = safeGetElement('performance-filter');
        const resultsCount = safeGetElement('results-count');
        const container = safeGetElement('studies-list');
        
        if (!container) return;
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const disciplineFilterValue = disciplineFilter ? disciplineFilter.value : '';
        const dateFrom = dateFromInput ? dateFromInput.value : '';
        const dateTo = dateToInput ? dateToInput.value : '';
        const performanceFilterValue = performanceFilter ? performanceFilter.value : '';
        
        let filteredStudies = [...APP_STATE.studies];
        
        // Apply filters
        if (searchTerm) {
            filteredStudies = filteredStudies.filter(s => 
                s.topic.toLowerCase().includes(searchTerm) ||
                getDisciplineName(s.discipline).toLowerCase().includes(searchTerm) ||
                (s.observations && s.observations.toLowerCase().includes(searchTerm))
            );
        }
        
        if (disciplineFilterValue) {
            filteredStudies = filteredStudies.filter(s => s.discipline === disciplineFilterValue);
        }
        
        if (dateFrom) {
            filteredStudies = filteredStudies.filter(s => s.studyDate >= dateFrom);
        }
        
        if (dateTo) {
            filteredStudies = filteredStudies.filter(s => s.studyDate <= dateTo);
        }
        
        if (performanceFilterValue) {
            const [min, max] = performanceFilterValue.split('-').map(Number);
            filteredStudies = filteredStudies.filter(s => s.percentage >= min && s.percentage <= max);
        }
        
        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `${filteredStudies.length} estudos encontrados`;
        }
        
        // Sort by study date (most recent first)
        filteredStudies.sort((a, b) => new Date(b.studyDate) - new Date(a.studyDate));
        
        if (filteredStudies.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>Nenhum estudo encontrado</h3></div>';
            return;
        }
        
        container.innerHTML = filteredStudies.map(study => {
            const disciplineName = getDisciplineName(study.discipline);
            let performanceClass = 'review-performance--good';
            if (study.percentage < 80) performanceClass = 'review-performance--average';
            if (study.percentage < 60) performanceClass = 'review-performance--poor';
            
            return `
                <div class="study-item">
                    <div class="study-header">
                        <div class="study-info">
                            <h4>${study.topic}</h4>
                            <div class="study-discipline">${disciplineName}</div>
                        </div>
                        <div class="study-performance ${performanceClass}">
                            ${study.percentage}%
                        </div>
                    </div>
                    <div class="study-details">
                        <div class="study-detail">
                            <strong>Data do Estudo:</strong> <span>${formatDate(study.studyDate)}</span>
                        </div>
                        <div class="study-detail">
                            <strong>Questões:</strong> <span>${study.correctAnswers}/${study.totalQuestions}</span>
                        </div>
                        <div class="study-detail">
                            <strong>Tempo:</strong> <span>${study.studyTime ? formatDuration(study.studyTime) : 'N/A'}</span>
                        </div>
                        <div class="study-detail">
                            <strong>Próxima Revisão:</strong> <span>${formatDate(study.nextReview)}</span>
                        </div>
                    </div>
                    ${study.observations ? `<div class="study-observations">${study.observations}</div>` : ''}
                </div>
            `;
        }).join('');
        
        console.log('Studies history rendered');
    } catch (e) {
        console.error('Error rendering studies history:', e);
    }
};

// Settings functions
const updateSettingsForm = () => {
    try {
        const dailyGoalInput = safeGetElement('daily-goal');
        if (dailyGoalInput) {
            dailyGoalInput.value = APP_STATE.settings.dailyGoal;
        }
    } catch (e) {
        console.error('Error updating settings form:', e);
    }
};

const initSettings = () => {
    try {
        const saveGoalsBtn = safeGetElement('save-goals');
        const customDisciplineForm = safeGetElement('custom-discipline-form');
        
        if (saveGoalsBtn) {
            saveGoalsBtn.addEventListener('click', () => {
                const dailyGoalInput = safeGetElement('daily-goal');
                if (dailyGoalInput) {
                    APP_STATE.settings.dailyGoal = parseInt(dailyGoalInput.value);
                    saveData();
                    updateDashboardStats();
                    showToast('Meta diária salva!', 'success');
                }
            });
        }
        
        if (customDisciplineForm) {
            customDisciplineForm.addEventListener('submit', handleCustomDisciplineSubmit);
        }
        
        console.log('Settings initialized');
    } catch (e) {
        console.error('Error initializing settings:', e);
    }
};

const handleCustomDisciplineSubmit = (e) => {
    try {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('custom-discipline-name').trim();
        const topicsString = formData.get('custom-discipline-topics').trim();
        
        if (!name || !topicsString) {
            showToast('Nome e tópicos são obrigatórios', 'error');
            return;
        }
        
        if (APP_STATE.disciplines.some(d => d.nome.toLowerCase() === name.toLowerCase())) {
            showToast('Já existe uma disciplina com esse nome', 'error');
            return;
        }
        
        const topics = topicsString.split(',').map(t => t.trim()).filter(t => t);
        
        const newDiscipline = {
            id: Math.max(...APP_STATE.disciplines.map(d => d.id)) + 1,
            nome: name,
            assuntos: topics,
            isCustom: true
        };
        
        APP_STATE.disciplines.push(newDiscipline);
        saveData();
        
        showToast('Disciplina customizada adicionada com sucesso!', 'success');
        e.target.reset();
        
        renderDisciplinesList();
        populateDisciplineSelect();
        initHistoryFilters();
    } catch (e) {
        console.error('Error submitting custom discipline:', e);
        showToast('Erro ao adicionar disciplina', 'error');
    }
};

const renderDisciplinesList = () => {
    try {
        const container = safeGetElement('disciplines-list');
        if (!container) return;
        
        container.innerHTML = APP_STATE.disciplines.map(discipline => `
            <div class="discipline-item">
                <div class="discipline-info">
                    <h5>${discipline.nome} ${discipline.isCustom ? '(Customizada)' : ''}</h5>
                    <div class="discipline-topics">${discipline.assuntos.join(', ')}</div>
                </div>
                <div class="discipline-actions">
                    ${discipline.isCustom ? `
                        <button class="btn-delete" onclick="deleteDiscipline(${discipline.id})">
                            Excluir
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        console.log('Disciplines list rendered');
    } catch (e) {
        console.error('Error rendering disciplines list:', e);
    }
};

const deleteDiscipline = (disciplineId) => {
    try {
        const isUsed = APP_STATE.studies.some(s => s.discipline == disciplineId);
        
        if (isUsed) {
            showToast('Não é possível excluir disciplina que possui estudos cadastrados', 'error');
            return;
        }
        
        showConfirmModal(
            'Excluir Disciplina',
            'Tem certeza que deseja excluir esta disciplina?',
            () => {
                APP_STATE.disciplines = APP_STATE.disciplines.filter(d => d.id !== disciplineId);
                saveData();
                showToast('Disciplina excluída com sucesso!', 'success');
                renderDisciplinesList();
                populateDisciplineSelect();
                initHistoryFilters();
            }
        );
    } catch (e) {
        console.error('Error deleting discipline:', e);
        showToast('Erro ao excluir disciplina', 'error');
    }
};

// Backup functions
const initDataManagement = () => {
    try {
        const exportBtn = safeGetElement('export-data');
        const copyBtn = safeGetElement('copy-data');
        const showBtn = safeGetElement('show-data');
        const hideBtn = safeGetElement('hide-data');
        const selectAllBtn = safeGetElement('select-all-data');
        const importBtn = safeGetElement('import-data');
        const importFile = safeGetElement('import-file');
        const clearBtn = safeGetElement('clear-data');
        
        if (exportBtn) exportBtn.addEventListener('click', exportData);
        if (copyBtn) copyBtn.addEventListener('click', copyDataToClipboard);
        if (showBtn) showBtn.addEventListener('click', showDataForCopy);
        if (hideBtn) hideBtn.addEventListener('click', hideDataDisplay);
        if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllData);
        if (importBtn) importBtn.addEventListener('click', () => importFile && importFile.click());
        if (importFile) importFile.addEventListener('change', importData);
        if (clearBtn) clearBtn.addEventListener('click', clearAllData);
        
        console.log('Data management initialized');
    } catch (e) {
        console.error('Error initializing data management:', e);
    }
};

const getBackupData = () => {
    return {
        studies: APP_STATE.studies,
        disciplines: APP_STATE.disciplines,
        settings: APP_STATE.settings,
        exportDate: new Date().toISOString(),
        version: "2.0"
    };
};

const exportData = () => {
    try {
        const data = getBackupData();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `med-study-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Dados exportados com sucesso!', 'success');
    } catch (e) {
        console.error('Error exporting data:', e);
        showToast('Erro ao exportar dados', 'error');
    }
};

const copyDataToClipboard = async () => {
    try {
        const data = getBackupData();
        const jsonString = JSON.stringify(data, null, 2);
        
        const success = await copyToClipboard(jsonString);
        
        if (success) {
            showToast('Dados copiados para a área de transferência!', 'success');
        } else {
            showToast('Erro ao copiar dados. Use o botão "Ver Dados" para copiar manualmente.', 'error');
            showDataForCopy();
        }
    } catch (e) {
        console.error('Error copying data:', e);
        showToast('Erro ao copiar dados', 'error');
    }
};

const showDataForCopy = () => {
    try {
        const data = getBackupData();
        const jsonString = JSON.stringify(data, null, 2);
        
        const textarea = safeGetElement('data-textarea');
        const display = safeGetElement('data-display');
        
        if (textarea) textarea.value = jsonString;
        if (display) display.classList.remove('hidden');
        
        showToast('Dados exibidos abaixo. Você pode selecionar e copiar manualmente.', 'info');
    } catch (e) {
        console.error('Error showing data:', e);
    }
};

const hideDataDisplay = () => {
    try {
        const display = safeGetElement('data-display');
        if (display) display.classList.add('hidden');
    } catch (e) {
        console.error('Error hiding data display:', e);
    }
};

const selectAllData = () => {
    try {
        const textarea = safeGetElement('data-textarea');
        if (textarea) {
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            showToast('Texto selecionado! Use Ctrl+C para copiar.', 'info');
        }
    } catch (e) {
        console.error('Error selecting all data:', e);
    }
};

const importData = (e) => {
    try {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!data.studies || !data.disciplines) {
                    throw new Error('Formato de arquivo inválido');
                }
                
                showConfirmModal(
                    'Importar Dados',
                    'Isso irá substituir todos os dados atuais. Deseja continuar?',
                    () => {
                        APP_STATE.studies = data.studies;
                        APP_STATE.disciplines = data.disciplines;
                        APP_STATE.settings = { ...APP_STATE.settings, ...(data.settings || {}) };
                        
                        // Recalculate streak
                        APP_STATE.settings.currentStreak = calculateStreak();
                        if (APP_STATE.settings.currentStreak > APP_STATE.settings.longestStreak) {
                            APP_STATE.settings.longestStreak = APP_STATE.settings.currentStreak;
                        }
                        
                        saveData();
                        
                        // Refresh all views
                        initializeAllViews();
                        
                        showToast('Dados importados com sucesso!', 'success');
                    }
                );
            } catch (error) {
                showToast('Erro ao importar dados: arquivo inválido', 'error');
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    } catch (e) {
        console.error('Error importing data:', e);
        showToast('Erro ao importar dados', 'error');
    }
};

const clearAllData = () => {
    try {
        showConfirmModal(
            'Limpar Todos os Dados',
            'Isso irá excluir permanentemente todos os estudos e disciplinas customizadas. Esta ação não pode ser desfeita.',
            () => {
                localStorage.removeItem('medStudyApp');
                APP_STATE.studies = [];
                APP_STATE.disciplines = [...INITIAL_DATA.disciplines];
                APP_STATE.settings = { ...INITIAL_DATA.settings };
                saveData();
                
                // Refresh all views
                initializeAllViews();
                
                showToast('Todos os dados foram limpos!', 'success');
            }
        );
    } catch (e) {
        console.error('Error clearing data:', e);
        showToast('Erro ao limpar dados', 'error');
    }
};

// Modal functions
const showConfirmModal = (title, message, onConfirm) => {
    try {
        const modal = safeGetElement('confirm-modal');
        const titleEl = safeGetElement('confirm-title');
        const messageEl = safeGetElement('confirm-message');
        const cancelBtn = safeGetElement('confirm-cancel');
        const okBtn = safeGetElement('confirm-ok');
        
        if (!modal || !titleEl || !messageEl || !cancelBtn || !okBtn) return;
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        modal.classList.remove('hidden');
        
        const handleCancel = () => {
            modal.classList.add('hidden');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
        };
        
        const handleOk = () => {
            modal.classList.add('hidden');
            onConfirm();
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
        };
        
        cancelBtn.addEventListener('click', handleCancel);
        okBtn.addEventListener('click', handleOk);
    } catch (e) {
        console.error('Error showing confirm modal:', e);
    }
};

// Timer initialization
const initTimer = () => {
    try {
        const startBtn = safeGetElement('timer-start');
        const pauseBtn = safeGetElement('timer-pause');
        const stopBtn = safeGetElement('timer-stop');
        const resetBtn = safeGetElement('timer-reset');
        
        if (startBtn) startBtn.addEventListener('click', startTimer);
        if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
        if (stopBtn) stopBtn.addEventListener('click', stopTimer);
        if (resetBtn) resetBtn.addEventListener('click', resetTimer);
        
        updateTimerDisplay();
        
        console.log('Timer initialized');
    } catch (e) {
        console.error('Error initializing timer:', e);
    }
};

// Initialize all views
const initializeAllViews = () => {
    try {
        updateDashboard();
        renderReviewLists();
        renderStudiesHistory();
        renderDisciplinesList();
        updateSettingsForm();
        
        // Re-setup study form if on cadastro tab
        if (APP_STATE.currentTab === 'cadastro') {
            setupStudyForm();
        }
        
        console.log('All views initialized');
    } catch (e) {
        console.error('Error initializing all views:', e);
    }
};

// Main app initialization
const initApp = () => {
    try {
        console.log('Starting Med Study App...');
        
        // Load data first
        loadData();
        
        // Initialize all components
        initNavigation();
        initTimer();
        initStudyForm();
        initHistoryFilters();
        initSettings();
        initDataManagement();
        
        // Initialize views
        initializeAllViews();
        
        console.log('Med Study App initialized successfully!');
        showToast('Med Study carregado com sucesso! 🎉', 'success');
        
    } catch (e) {
        console.error('Critical error initializing app:', e);
        showToast('Erro ao carregar aplicação. Verifique o console.', 'error');
    }
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}