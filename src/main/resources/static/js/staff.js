import { AuthManager } from './modules/auth.js';
import { ModalManager } from './modules/modal.js';
import { MovieManager } from './modules/movie-management.js';
import { StaffManager } from './modules/staff-management.js';
import { ScheduleManager } from './modules/schedule-management.js';

class StaffPage {
    constructor() {
        this.scheduleManager = new ScheduleManager();
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Make managers available globally for onclick handlers
        window.MovieManager = MovieManager;
        window.StaffManager = StaffManager;
        window.scheduleManager = this.scheduleManager;
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            AuthManager.setupLoginButtons();
            AuthManager.checkLoginStatus();
            this.setupStaffButtons();
        });
    }

    setupStaffButtons() {
        document.getElementById('manage-movies-btn').addEventListener('click', () => {
            this.toggleSection('movies-section');
            MovieManager.loadMovies();
        });

        document.getElementById('manage-staff-btn').addEventListener('click', () => {
            this.toggleSection('staff-section');
            StaffManager.loadStaff();
        });

        document.getElementById('manage-schedule-btn').addEventListener('click', () => {
            this.toggleSection('schedule-section');
            this.scheduleManager.loadSchedule();
        });

        document.getElementById('add-movie-btn').addEventListener('click', () => {
            MovieManager.openMovieForm();
        });

        document.getElementById('add-staff-btn').addEventListener('click', () => {
            StaffManager.openStaffForm();
        });

        document.getElementById('add-shift-btn').addEventListener('click', () => {
            this.scheduleManager.openShiftForm();
        });
    }

    toggleSection(sectionId) {
        const moviesSection = document.getElementById('movies-section');
        const staffSection = document.getElementById('staff-section');
        const scheduleSection = document.getElementById('schedule-section');

        moviesSection.style.display = 'none';
        staffSection.style.display = 'none';
        scheduleSection.style.display = 'none';

        document.getElementById(sectionId).style.display = 'block';
    }
}

// Initialize the staff page
const staffPage = new StaffPage();
staffPage.init();