export class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.shows = [];
    }

    // calendar.js og calendar-core.js er delt op da den side vi er på nu er en hjælpe vil til calendar.js
    // herinde funktioner til indlæsning af data og visning af kalenderen loaded, så calendar.js nemt kan hente funktionerne
    // Det er opdelt da calendar.js er en lang fil, netop fordi den primært står for UI- og præsentationslaget

    // Henter data fra API kald
    async loadShows(startDate, endDate) {
        try {
            const response = await fetch(`/api/shows/between?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            if (!response.ok) {
                throw new Error('Kunne ikke hente forestillinger');
            }
            this.shows = await response.json();
            return this.shows;
        } catch (error) {
            console.error('Fejl ved at hente forestillinger:', error);
            throw error;
        }
    }

    getShowsForDate(date) {
        return this.shows.filter(show => {
            const showDate = new Date(show.showTime);
            return this.isSameDay(showDate, date);
        });
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    getMonthYearString(date) {
        const months = [
            'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
}