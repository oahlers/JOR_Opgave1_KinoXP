export class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.shows = [];
    }

    async loadShows(startDate, endDate) {
        try {
            const response = await fetch(`/api/shows/between?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
            if (!response.ok) {
                throw new Error('Kunne ikke hente forestillinger');
            }
            this.shows = await response.json();
            return this.shows;
        } catch (error) {
            console.error('Error loading shows:', error);
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

    generateShowsHTML(dayShows) {
        if (dayShows.length === 0) {
            return '<div class="no-shows">Ingen forestillinger</div>';
        }

        const showsByMovieAndTheater = {};
        dayShows.forEach(show => {
            const movieTitle = show.movie ? show.movie.title : 'Ukendt film';
            const theaterName = show.theater ? show.theater.name : 'Ukendt teater';
            const key = `${movieTitle}-${theaterName}`;

            if (!showsByMovieAndTheater[key]) {
                showsByMovieAndTheater[key] = {
                    movieTitle: movieTitle,
                    theaterName: theaterName,
                    shows: []
                };
            }
            showsByMovieAndTheater[key].shows.push(show);
        });

        let html = '';
        Object.values(showsByMovieAndTheater).forEach(({ movieTitle, theaterName, shows }) => {
            html += `<div class="movie-day">`;
            html += `<div class="movie-title" title="${movieTitle}">${movieTitle}</div>`;
            html += `<div class="theater-name">${theaterName}</div>`;

            const showsByTime = {};
            shows.forEach(show => {
                const time = new Date(show.showTime).toLocaleTimeString('da-DK', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (!showsByTime[time]) {
                    showsByTime[time] = [];
                }
                showsByTime[time].push(show);
            });

            Object.keys(showsByTime).forEach(time => {
                const showsAtTime = showsByTime[time];
                const show = showsAtTime[0];

                html += `
                    <div class="show-time" onclick="window.calendarHandlers.openShowDetails(${show.id})" 
                         title="${movieTitle} - ${time} - ${theaterName}">
                        ${time}
                    </div>
                `;
            });

            html += `</div>`;
        });

        return html;
    }
}