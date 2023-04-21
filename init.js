'use strict';

const node = document.getElementById('app');

// Update the second argument to `Elm.Main.embed` with your selected API. See
// the Intro section of the technical assessment documentation for more
// information:
// https://technical-assessment.konicaminoltamarketplace.com
const app = Elm.Main.embed(node, {
    api: 'Client',
    hostname: '',
});

app.ports.startTimer.subscribe((int) => {
    setTimeout(() => {
        app.ports.timeout.send(int);
    }, 10000);
});

app.ports.request.subscribe((message) => {

    //Take the message and turn the string into JSON
    message = JSON.parse(message);

    //Get the JSON response from the function based on the incoming json object
    var responseObj = processIncomingRequest(message);

    // Parse the message to determine a response, then respond:
    app.ports.response.send(responseObj);
});
