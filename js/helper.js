// Helper to parse date strings
function parseDateTime(str) {
    // Example input: "May 12, 2025 0700"
    // Convert "0700" to "07:00"
    const parts = str.split(' ');
    let time = parts.pop(); // "0700"
    time = time.slice(0, 2) + ':' + time.slice(2);
    const dateStr = parts.join(' ');
    return new Date(dateStr + ' ' + time);
}
// Helper to format date into "D MMM YYYY HHmm" (like your format)
function formatDateTime(date) {
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}${minutes}`;
}
window.parseDateTime = parseDateTime;
window.formatDateTime = formatDateTime;