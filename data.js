const PLANS = ['Streaming', 'Cloud', 'Learning', 'Fitness', 'Music'];

const wait = ms => new Promise(res => setTimeout(res, ms));

export async function fetchPlans() {
    await wait(300);
    return [...PLANS];
}

export async function fetchInitialSubscriptions() {
    await wait(500);
    if (Math.random() < 0.25) throw new Error('NETWORK_ERROR');
    return [
        {
            id: 's1',
            name: 'StreamMax',
            plan: 'Streaming',
            amount: 12.99,
            status: 'active',
            date: '2026-07-01'
        },
        {
            id: 's2',
            name: 'CloudBox',
            plan: 'Cloud',
            amount: 9.99,
            status: 'active',
            date: '2026-07-03'
        },
        {
            id: 's3',
            name: 'FitNow',
            plan: 'Fitness',
            amount: 19.99,
            status: 'paused',
            date: '2026-07-05'
        },
        {
            id: 's4',
            name: 'LearnPro',
            plan: 'Learning',
            amount: 24.99,
            status: 'active',
            date: '2026-07-08'
        },
        {
            id: 's5',
            name: 'TuneFlow',
            plan: 'Music',
            amount: 7.99,
            status: 'cancelled',
            date: '2026-07-10'
        },
    ];
}