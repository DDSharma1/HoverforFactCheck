const p = document.createElement('p');
p.innerHTML = '<span style="color:#98fb98 ; font-weight:bold">Hover over the text you want to verify for 5 seconds </span>';
document.body.insertBefore(p, document.body.firstChild);
// stick the logo too
const img = document.createElement('img');
img.src = chrome.runtime.getURL('images/logo48.png');
document.body.insertBefore(img, document.body.firstChild);


const prependText  = "Is the following text delimited by triple backticks true? Give your answer as a single word, either 'True' or 'False' or 'Unknown'. ``` ";
const appendText = " ```";
const lTrue = '<span style="color:#008000; font-weight:bold">Generally True: </span>';
const lUnknown = '<span style="color:#98fb98 ; font-weight:bold">Not sure if True of False: </span>';
const lFalse = '<span style="color:#ff0000; font-weight:bold">Generally False: </span>';
var toggle = true;

/* Get the element under the mouse (hovering after 2 sec) and validate for fact check */
/* You can't delay firing of the event but you can delay the handling of the event    */

document.addEventListener('mousemove', handleMouseMove, e => {

  }, {passive: false})

let prevPara = ""; /* Need to track it so hovering on the same text doesn't trigger multiple validations */ 
let timeoutId; // Stores the timeout ID
function handleMouseMove(event){
    clearTimeout(timeoutId); // Clear any previous timeouts
    
    // Start a new timeout to trigger an action after a delay
    timeoutId = setTimeout(() => {
        // Perform the desired action
        //console.log('Action triggered after delay');
        const element = document.elementFromPoint(event.clientX, event.clientY);
        para = element.textContent;
        console.log(`text of the element under the mouse is: ${para}`);
        if (para.length < 25 || para == prevPara) {
            //do nothing if the length of the hovered element is <25 or hovering continues at one place
            // TODO move the para length as a setting in the config file.
           return;
        }
        validateRequest(para) 
        .then((pAnswer => {
            //console.log(`Executing the callback after the validateRequest and answer = ${pAnswer}`);
            prevPara = para;  // now set the prevPara
            switch (pAnswer){
                case 'True':
                    element.innerHTML = lTrue.concat(element.innerHTML);
                    break;
                case 'False':
                    element.innerHTML = lFalse.concat(element.innerHTML);
                    break;
                case 'Unknown':
                    element.innerHTML = lUnknown.concat(element.innerHTML);
                    break;
                default:
                    element.innerHTML = lUnknown.concat(element.innerHTML);
                    console.log("Unexpected response from API:", pAnswer)
                    break;
            }
        }))
    }, 5000); // Delay in milliseconds (e.g., 1000ms = 1 second); It should really come from a config file.
}



  function validateRequest(pText){
    /*
        This function takes only one request and submits it to a desired graph on the backend
        for executions. After it receives the resonses to all the requests, it sends the response array back.
    */  
    // move the graph URL, graph name, graph user name, funding key etc to config file and retrieve it from there
    const url = "https://www.hyperthetical.dev/rungraph";
    const graphName = "Basic";
    const graphUserName = "dd";
    const fundingKey = "b6814a9b-3b7e-43fb-a0ab-8097ec1edb3b";
    const headers = {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
    };
    const data = {
        "graphName": graphName,
        "graphUserName": graphUserName,
        "inputData": {
            "Dialog": [ 
                pText 
            ]
        },
        "fundingKey": fundingKey,
        "pollingGuid": "some-polling-guid-dd"
    };
    console.log(`The graph execution url is: ${url} and the text passed is: ${pText}`);
    return fetch(url, {
        headers: headers,
        body: JSON.stringify(data),
        method: 'POST'
    }).then (result=> {
        if (!result.ok){
            throw new Error('API call did not succeed.');
        }
        return result.json();
        })
        .catch(error => {
            console.error('Error fetching data', error);
            throw error;
        });

}

