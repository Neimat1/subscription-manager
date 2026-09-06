# Notes - Assignment 1 

## Part 1
* 1-B
* 2-D
* 3-B
* 4-C
* 5-A
* 6-B
* 7-D
* 8-B
* 9-A
* 10-C


## Part 2
1.   How did you make the two requests run at the same time? this done by using `promise.all` so we depend on running both `fetPlans` and `fetchInitialSubscriptions` this will take thhe max time so it just take 500ms. mainly the drawback here is if one of requests fail and the other success both will fails .
```
// example from code for the concurrency here
async function loadDashboard() {
    showState('LOADING');
    try {
        let [plans, subscriptions] = await Promise.all(
            [fetchPlans(), fetchInitialSubscriptions()]
        );
        allSubscriptions = subscriptions;
        renderSubscriptions(subscriptions, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter);
        renderFilters(plans, planFilterContainer, 'Plan');
        renderFilters(statuses, statusFilterContainer, 'Status');

        renderSelectFormElement(plans, selectPlan)
        renderSelectFormElement(statuses, selectStatus)
        getSummary();
        showState('SUCCESS')

    } catch (err) {
        renderErrorState(err.message);
        showState('ERROR');
    }
}
```

if we tried to use the sequential it will be slower why because we will await for each fetch to be loaded so the total time will be 800ms the summation of both.
```
// example for how sequntial calls triggered  here
async function loadDashboard() {
    showState('LOADING');
    try {
        let plans = await fetchPlans();
        let subscriptions = await fetchInitialSubscriptions();
        //let [plans, subscriptions] = await Promise.all(
          //  [fetchPlans(), fetchInitialSubscriptions()]
        //); 
        allSubscriptions = subscriptions;
        renderSubscriptions(subscriptions, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter);
        renderFilters(plans, planFilterContainer, 'Plan');
        renderFilters(statuses, statusFilterContainer, 'Status');

        renderSelectFormElement(plans, selectPlan)
        renderSelectFormElement(statuses, selectStatus)
        getSummary();
        showState('SUCCESS')

    } catch (err) {
        renderErrorState(err.message);
        showState('ERROR');
    }
}
```
2.  Why is event delegation a better fit for the filter buttons than adding a listener to each one? as if you have a `span` elemnt inside a `button` and just only clicked on that span, button will not afetced and if you also have a list of button each one do something you will not forced to create event listener for each button. and the most important part that makes delegation better is using parent element to fire the theh event and using `event.target.closest`
