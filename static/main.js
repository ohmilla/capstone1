// find the DOM element where random activities will appear on the main homepage
const $boredBoardHomeapge = $("#boredboard-home");
const $filterResults = $("#filter-results");
const $fitlerButton = $("#filter-btn");
const $randomUserHome = $("#random-home");
const $getRandom = $("#get-random");

// Start with a random activity showing when DOM loads
get_random();

// Returns activity types as titlecase/capitolize except DIY as all uppercase
function fixLowerCaseforType(type) {
    if (type == 'diy') {
        return type.toUpperCase()
    }
    else {
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
}

// returns activity price range as dollar signs instead of decimals
function createPriceSymbols(price) {
    if (price == 0) {
        return 'Free!'
    }
    else if (price > 0 && price <= 0.2) {
        return `$`
    }
    else if (price > 0.2 && price <= 0.3) {
        return '$$'
    }
    else if (price >= 0.4) {
        return '$$$'
    }
}

// Returns the HTML markup for a random activity
function generateRandomActivity(activity) {
    let type = fixLowerCaseforType(activity.type)
    let price = createPriceSymbols(activity.price)
    return `
        <div id = ${activity.key} style="height: 72px">
            <h5 class="h-100 text-center">${activity.activity}</h5>
        </div>
        <hr>
        <div class="row">
            <p class="lh-lg">
                Type: ${type} <br>  
                Price Rating: ${price}<br>
                Number of Participants: ${activity.participants}<br>
            </p>
            <div class="d-flex justify-content-center">
                <a class="btn btn-success btn-sm mx-1" href='/activity/${activity.key}/save'>Save</a>
                <button class="get-random btn btn-primary btn-sm mx-1">Get Another Activity</button>
            </div>
        </div>`
}

// Returns the HTML markup for a filtered activity
function generateFilteredActivity(activity) {
    let type = fixLowerCaseforType(activity.type)
    let price = createPriceSymbols(activity.price)
    return `
        <div id = ${activity.key} style="height: 72px">
            <h5 class="text-center h-100">${activity.activity}</h5>
        </div>
        <hr>
        <div>
            <p class="lh-lg">
                Type: ${type} <br>  
                Price Rating: ${price}<br>
                Number of Participants: ${activity.participants}<br>
            </p>
            <div class="d-flex justify-content-center">
                <a class="btn btn-success btn-sm mx-1" href='/activity/${activity.key}/save'>Save</a>
            </div>
        </div>`
}

// Get and show a random activity. 
async function get_random(){
    const activityData = await axios.get(`http://127.0.0.1:5000/random`);
    let activity = $(generateRandomActivity(activityData.data));
    $randomUserHome.empty();
    $randomUserHome.append(activity);
}

// Use the parameters set by the user to filter for and show an activity. 
async function get_filtered_activity() {
    let activity_type = $("#type").val();
    let price = $("#price").val();
    let participants = $("#participants").val();
    const activityData = await axios.post(`http://127.0.0.1:5000/home`, {
        activity_type, price, participants});
    if (activityData.data.error) {
        $filterResults.empty();
        error = $(generateFilterError())
        $filterResults.append(error);
    }
    else {
        let activity = $(generateFilteredActivity(activityData.data));
        $filterResults.empty();
        $filterResults.append(activity);
    }
}

// Give error message if there is not an activity with specified parameters. 
function generateFilterError() {
    return `
    <div>
        <p>No activity found with the specified parameters.
        </p>
    </div>`
}  

// When the random button is clicked, call get_random()
$("#random-home").on("click", ".get-random", async function(e) {
    e.preventDefault();
    await get_random();
})

// When the filter button is clicked, call get_filtered_activity()
$("#filter-btn").on("click", async function(e) {
    e.preventDefault();
    await get_filtered_activity();
})


