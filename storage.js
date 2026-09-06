const LOCAL_STORAGE_KEY = 'subscriptions';

export function saveSubscriptions(subscriptions) {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscriptions))
    } catch (error) {
        console.error(`Something went wrong: ${error.message}`)
    }
}

export function loadSubscriptions() {
    try {
        const subscriptions = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!subscriptions) return [];
        const subscriptionsDataAsJson = JSON.parse(subscriptions);
        return Array.isArray(subscriptionsDataAsJson) ? subscriptionsDataAsJson : [];

    } catch (error) {
        console.error(`Something went wrong: ${error.message}`)
    }
}