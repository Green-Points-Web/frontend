const API_URL = "http://127.0.0.1:8000/dashboard";

export const getDashboardSummary = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

export async function getRecentHistory(limit = 200) {
    const response = await axios.get(
        `http://127.0.0.1:8000/history?limit=${limit}&order=desc`
    );
    return response.data;
}

export async function getActionCatalog() {
    const response = await axios.get("http://127.0.0.1:8000/catalog");
    return response.data;
}