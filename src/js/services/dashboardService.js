const API_URL = "http://127.0.0.1:8000/dashboard";
export const getDashboardSummary = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

export async function getRecentHistory(limit = 200) {
    const response = await fetch(
        `http://127.0.0.1:8000/history?limit=${limit}&order=desc`
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function getActionCatalog() {
    const response = await fetch("http://127.0.0.1:8000/catalog");

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}
