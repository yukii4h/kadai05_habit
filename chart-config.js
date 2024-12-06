import { getWeeklyRecords, getMonthlyRecords } from './script.js';

let weeklyChartInstance = null;  
let monthlyChartInstance = null; 

async function updateCharts() {
    const weeklyRecords = await getWeeklyRecords();
    const monthlyRecords = await getMonthlyRecords();

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');  // 月は0から始まるため+1
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;  // YYYY/MM/DD形式にする
    };

    // Weekly chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    
    // 既存のチャートがある場合、それを破棄する
    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: weeklyRecords.map(record => formatDate(record.date)),  // 日付をフォーマット
            datasets: [{
                label: '実施時間（分）',
                data: weeklyRecords.map(record => record.minutes),
                backgroundColor: '#4299e1',
                borderColor: '#3182ce',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 200, // 最大値を調整
                    ticks: {
                        stepSize: 10 // ステップ幅
                    }
                }
            }
        }
    });

    // Monthly chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    
    // 既存のチャートがある場合、それを破棄する
    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    monthlyChartInstance = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: monthlyRecords.map(record => formatDate(record.date)),  // 日付をフォーマット
            datasets: [{
                label: '実施時間（分）',
                data: monthlyRecords.map(record => record.minutes),
                borderColor: '#4299e1',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 600, // 最大値を調整
                    ticks: {
                        stepSize: 50 // ステップ幅
                    }
                }
            }
        }
    });
}

export { updateCharts };