
export const formatTime = (time: Date) => { 
    const now = new Date().getTime();
    const diffInMs = now - time.getTime();

    // Zaman farkı hesaplama
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    const diffInYears = diffInDays / 365;

    // Farklı durumlar için formatlama
    if (diffInHours < 24) {
        return time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours >= 24 && diffInHours < 48) {
        return 'Dün ' + time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInYears < 1) {
        return time.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    } else {
        return time.toLocaleDateString('tr-TR', { year: '2-digit', month: '2-digit', day: '2-digit' });
    }
}

export const calculateTimeDiff = (date: Date) => {
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} yıl önce`;
    }

    if (months > 0) {
        return `${months} ay önce`;
    }

    if (days > 0) {
        return `${days} gün önce`;
    }

    if (hours > 0) {
        return `${hours} saat önce`;
    }

    if (minutes > 0) {
        return `${minutes} dakika önce`;
    }

    return 'Şimdi';
}
