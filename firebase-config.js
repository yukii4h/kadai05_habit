import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const HABITS_COLLECTION = 'habits';
const RECORDS_COLLECTION = 'habitRecords';

// Helper functions
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Database operations
async function saveHabit(habitName) {
    try {
        await setDoc(doc(db, HABITS_COLLECTION, 'userHabit'), {
            habit: habitName,
            createdAt: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error saving habit:", error);
        throw error;
    }
}

async function getHabit() {
    try {
        const docRef = doc(db, HABITS_COLLECTION, 'userHabit');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error fetching habit:", error);
        throw error;
    }
}

async function saveRecord(minutes) {
    const today = getToday();
    try {
        await setDoc(doc(db, RECORDS_COLLECTION, formatDate(today)), {
            minutes: minutes,
            date: Timestamp.fromDate(today)
        });
        return true;
    } catch (error) {
        console.error("Error saving record:", error);
        throw error;
    }
}

async function getWeeklyRecords() {
    const endDate = getToday();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    try {
        const q = query(
            collection(db, RECORDS_COLLECTION),
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate)),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            date: doc.data().date.toDate(),
            minutes: doc.data().minutes
        }));
    } catch (error) {
        console.error("Error fetching weekly records:", error);
        throw error;
    }
}

async function getMonthlyRecords() {
    const endDate = getToday();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 29);

    try {
        const q = query(
            collection(db, RECORDS_COLLECTION),
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate)),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            date: doc.data().date.toDate(),
            minutes: doc.data().minutes
        }));
    } catch (error) {
        console.error("Error fetching monthly records:", error);
        throw error;
    }
}

export { 
    db,
    saveHabit,
    getHabit,
    saveRecord,
    getWeeklyRecords,
    getMonthlyRecords
};
