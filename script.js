import { 
    saveHabit, 
    getHabit, 
    saveRecord,
    getWeeklyRecords,
    getMonthlyRecords 
} from './firebase-config.js';

import { updateCharts } from './chart-config.js';  // ここで updateCharts をインポート

// Constants
const ENCOURAGEMENT_MESSAGES = [
    "すばらしい！今日も頑張りました！",
    "継続は力なり！その調子です！",
    "一歩一歩、確実に前進していますね！",
    "今日の積み重ねが、明日の自分を作ります！",
    "その調子！習慣化までもう少し！",
    "毎日の努力が実を結びます！",
    "あなたの成長が見えています！",
    "今日も目標達成、素晴らしいです！"
];

// Utility functions
function getRandomMessage() {
    const index = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
    return ENCOURAGEMENT_MESSAGES[index];
}

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.className = `message ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 3000);
}

// Page specific initialization
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes('index.html') || currentPage === '/') {
        initializeIndexPage();
    } else if (currentPage.includes('habit.html')) {
        await initializeHabitPage();
    }
});

// Index page initialization
async function initializeIndexPage() {
    const habitInput = document.getElementById('habitInput');
    const saveButton = document.getElementById('saveHabit');
    const messageElement = document.getElementById('message');

    // Check if habit already exists
    const existingHabit = await getHabit();
    if (existingHabit) {
        window.location.href = 'habit.html';
        return;
    }

    saveButton.addEventListener('click', async () => {
        const habitName = habitInput.value.trim();
        
        if (!habitName) {
            showMessage(messageElement, '習慣を入力してください', true);
            return;
        }

        try {
            await saveHabit(habitName);
            showMessage(messageElement, '習慣を保存しました！');
            setTimeout(() => {
                window.location.href = 'habit.html';
            }, 1000);
        } catch (error) {
            showMessage(messageElement, 'エラーが発生しました', true);
        }
    });
}

// Habit page initialization
async function initializeHabitPage() {
    const habitNameElement = document.getElementById('habitName');
    const minutesInput = document.getElementById('minutes');
    const submitButton = document.getElementById('submitTime');
    const messageElement = document.getElementById('message');
    const streakElement = document.getElementById('currentStreak');

    // Load habit name
    try {
        const habit = await getHabit();
        if (!habit) {
            window.location.href = 'index.html';
            return;
        }
        habitNameElement.textContent = habit.habit;
    } catch (error) {
        showMessage(messageElement, 'データの読み込みに失敗しました', true);
    }

    // Initialize charts
    await updateCharts(); 

    // Submit button handler
    submitButton.addEventListener('click', async () => {
        const minutes = parseInt(minutesInput.value, 10);
    
        if (isNaN(minutes) || minutes <= 0 || minutes > 1440) {
            showMessage(messageElement, '1分から24時間(1440分)の間で入力してください', true);
            return;
        }
    
        try {
            // ここでFirestoreにデータを保存
            await saveRecord(minutes);
    
            // 成功した場合、励ましのメッセージを表示
            const encouragementMessage = getRandomMessage();
            showMessage(messageElement, encouragementMessage);
    
            // 入力フィールドをクリア
            minutesInput.value = '';
    
            // チャートを更新
            await updateCharts();
    
        } catch (error) {
            console.error('Error during record save:', error);  // コンソールにエラー内容を表示
            showMessage(messageElement, '記録の保存に失敗しました: ' + error.message, true);
        }
    });
}

// Export functions for use in chart-config.js
export {
    getWeeklyRecords,
    getMonthlyRecords
};

async function fetchWeather(city) {
    const apiKey = '';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=ja&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`天気情報の取得に失敗しました: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function displayWeather() {
    const weatherElement = document.getElementById('weather');
    const city = 'Tokyo'; // 都市名を指定

    const weatherData = await fetchWeather(city);

    if (weatherData) {
        const { weather, main, name } = weatherData;
        const description = weather[0].description; // 天気の説明
        const temperature = main.temp; // 気温
        weatherElement.textContent = `${name}の天気: ${description}, 気温: ${temperature}°C`;
    } else {
        weatherElement.textContent = '天気情報を取得できませんでした。';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes('index.html') || currentPage === '/') {
        initializeIndexPage();
    } else if (currentPage.includes('habit.html')) {
        await initializeHabitPage();
    }

    // 天気情報を取得して表示
    await displayWeather();
});