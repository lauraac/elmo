// Require the Bolt package (github.com/slackapi/bolt)
const {
    App
} = require("@slack/bolt");
let moment = require('moment');
let {
    formView,
    states,
    clients,
    requestType,
    teamInCharge,
    priorities,
    blocksPostMessage
} = require("./data");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});
let result, selectedTime = "";


// All the room in the world for your code
moment.locale("es-mx");

let today = new Date();
// let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
let date = moment().format('YYYY-MM-DD');
let dateText = moment().format('LL');

//Fill fields
const fillFields = (data, field) => {
    let options;
    for (let i = 0; i < data.length; i++) {
        options = {
            text: {
                type: "plain_text",
                text: data[i],
                emoji: true,
            },
            value: data[i],
        };

        formView["blocks"][field]["element"]["options"].push(options);
    }
};

// Listen for a slash command invocation
app.command('/elmo', async({
    ack,
    payload,
    context
}) => {
    // Acknowledge the command request
    ack();

    if (formView["blocks"][4]["block_id"] == "movementDate") {
        formView["blocks"].splice(4, 1)

        console.log(formView["blocks"][7]);
    }

    //RequestType
    (formView["blocks"][3]["element"]["options"].length) === 0 ? fillFields(requestType, 3) : console.log("");
    //States
    (formView["blocks"][5]["element"]["options"].length) === 0 ? fillFields(states, 5) : console.log("");
    //Clients
    (formView["blocks"][6]["element"]["options"].length) === 0 ? fillFields(clients, 6) : console.log("");
    //Team in charge
    (formView["blocks"][7]["element"]["options"].length) === 0 ? fillFields(teamInCharge, 7) : console.log("");
    //Priority
    (formView["blocks"][8]["element"]["options"].length) === 0 ? fillFields(priorities, 8) : console.log("");

    try {
        result = await app.client.views.open({
            token: context.botToken,
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: payload.trigger_id,
            // View payload
            view: formView
        });
    } catch (error) {
        console.error(error);
    }
});


// Handle a view_submission event
app.view('view_incident', async({
    ack,
    body,
    view,
    context
}) => {
    // Acknowledge the view_submission event

    await ack();

    const title = view['state']['values']['incidentTitle']['titleInput']['value'];
    let description = (view['state']['values']['incidentDescription']['descriptionInput']["value"]) != null ? view['state']['values']['incidentDescription']['descriptionInput']["value"] : "";
    // const date = view['state']['values']['incidentDate']['selectedDate']['selected_date'];
    const userID = body['user']['id'];
    const userName = body['user']['name'];
    const requestTypes = view['state']['values']['requestType']['requestTypeInput']["selected_option"]["text"]["text"];
    let dateMovement = "";

    if (formView["blocks"][4]["block_id"] == "movementDate") {
        dateMovement = view['state']['values']['movementDate']['selectedDate']['selected_date'];
    }

    let zubaleroName = (view['state']['values']['zubaleroName']['zubaleroNameInput']["value"]) != null ? view['state']['values']['zubaleroName']['zubaleroNameInput']["value"] : "";
    let state = (view['state']['values']['states']['statesInput']["selected_option"]) != null ? view['state']['values']['states']['statesInput']["selected_option"]["text"]["text"] : "";
    const client = view['state']['values']['clients']['clientsInput']["selected_option"]["text"]["text"];
    const team = view['state']['values']['teamInCharge']['teamInChargeInput']["selected_option"]["text"]["text"];
    const priority = view['state']['values']['priorities']['prioritiesInput']["selected_option"]["text"]["text"];


    // Message to send user

    let msg = '';

    msg = 'Your submission for *' + title + '* was successful';

    blocksPostMessage[2]["text"]["text"] = "*Fecha:* " + date + ((description) != "" ? "\n\n*Descripción:* \n" + description : "") + "\n\n*Tipo de solicitud:* " + requestTypes + ((dateMovement) != "" ? "\n\n*Fecha de movimiento:* " + dateMovement : "") + ((zubaleroName) != "" ? "\n\n*Nombre del Zubalero:* " + zubaleroName : "") + ((state) != "" ? "\n\n*Estado:* " + state : "") + "\n\n*Cliente:* " + client + "\n\n*Equipo a cargo:* " + team + "\n\n*Prioridad:* " + priority;

    blocksPostMessage[1]["text"]["text"] = " *" + title + "*";

    blocksPostMessage[7]["elements"][0]["text"] = "Reportado por: <@" + userID + ">";

    try {
        const result = await app.client.chat.postMessage({
            token: context.botToken,
            channel: process.env.SLACK_CHANNEL,
            text: `New incident submitted!`,
            blocks: blocksPostMessage

        });

        let timestamp = result['ts']
            // newIncidentDatabase(timestamp, title, description, userName, userID);
            // newIncidentApplication(timestamp, usersAffected);
            // newIncidentUserAffected(timestamp, applicationsAffected);

    } catch (error) {
        console.error(error);
    }


    // Message the user
    try {
        await app.client.chat.postMessage({
            token: context.botToken,
            channel: userID,
            text: msg
        });
    } catch (error) {
        console.error(error);
    }




});

//Request Type selected
app.action('requestTypeInput', async({
    ack,
    body,
    say,
    view,
    context,
    payload
}) => {
    await ack();

    // let form = formView;
    let blocks = formView["blocks"];

    // console.log(blocks);
    const requestTypes = body['actions'][0]['selected_option']['text']['text'];
    let template = {
        "type": "input",
        "block_id": "movementDate",
        "element": {
            "type": "datepicker",
            "initial_date": date,
            "placeholder": {
                "type": "plain_text",
                "text": "Fecha del moviemiento",
                "emoji": true
            },
            "action_id": "selectedDate"
        },
        "label": {
            "type": "plain_text",
            "text": "Fecha del moviemiento",
            "emoji": true
        }
    };

    if (requestTypes == "Alta" || requestTypes == "Baja") {
        if (blocks[4]["block_id"] == "movementDate") {
            blocks.splice(4, 1, template)
        } else {
            blocks.splice(4, 0, template)
        }
    } else if (blocks[4]["block_id"] == "movementDate") {
        blocks.splice(4, 1)
    }

    try {
        const resultT = await app.client.views.update({
            token: context.botToken,
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: payload.trigger_id,
            // View payload
            view: formView,
            view_id: result["view"]["id"]
        });
    } catch (error) {
        console.error(error);
    }
});

const removeShowTimeResolved = (body, blocks) => {
    if (body['message']['blocks'][6]["type"] == "section" && body['message']['blocks'][7]["type"] == "actions") {
        blocks.splice(6, 1);
        blocks.splice(6, 1);
    } else if (body['message']['blocks'][6]["type"] == "section" && body['message']['blocks'][7]["type"] == "context") {
        blocks.splice(6, 1);
    }


};

//Listen for status dropdown
app.action('actualStatus', async({
    ack,
    body,
    say
}) => {

    await ack();

    let blocks = body['message']['blocks']
    let title = blocks[1]['text']['text']
    let description = blocks[2]['text']['text']
    let selectedStatus = body['actions'][0]['selected_option']['text']['text'];
    let timestamp = body['message']["ts"]




    // let pagerDutySuccess = true;
    // let pagerDutyService = null;
    // let pagerDutyNumber = null;

    // //Only create incident for orange and red
    // if (selected == "Orange :orange_heart:" || selected == "Red :alert:") {
    //   pagerDutyService = "PJ5MZFZ"; //Wally Service ID
    //   let pdResult = await newIncident(title, description, pagerDutyService);
    //   pagerDutySuccess = pdResult[0];
    //   pagerDutyNumber = pdResult[1];
    // }


    // if (pagerDutySuccess) { //TODO fix condition
    //   console.log("")
    //   acknowledgeMessage(timestamp, process.env.SLACK_CHANNEL, blocks, selected)
    //   acknowledgeIncidentDatabase(timestamp, pagerDutyService, pagerDutyNumber, selected.split(" ")[0])
    // }
});

//Listen for yime dropdown
app.action('timeSpentOption', async({
    ack,
    body,
    say,
    context
}) => {

    await ack();
    let timestamp = body["message"]["ts"]
    let selected = body["actions"][0]["selected_option"]["text"]["text"]
    let blocks = body["message"]["blocks"]
    selectedTime = body['actions'][0]['selected_option']['text']['text'];

    if (!blocks[8]) {
        let template = {
            "type": "actions",
            "elements": [{
                "type": "button",
                "action_id": "markResolved",
                "text": {
                    "type": "plain_text",
                    "text": "Finalizar ticket"
                },
                "value": "resolved"
            }]
        }

        blocks.splice(7, 0, template);
    }


    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
    }

    const reqBody = {
        "channel": process.env.SLACK_CHANNEL,
        "ts": timestamp,
        "blocks": blocks
    }

    axios.post("https://slack.com/api/chat.update", reqBody, {
            headers: headers
        })
        .then((res) => {
            return String(res.status) == "200"
        })

});

//Listen for Admitted button
app.action('markAdmitted', async({
    ack,
    body,
    say,
    context
}) => {

    await ack();

    let blocks = body['message']['blocks']
    let timestamp = body['message']["ts"]
    let userID = body['user']['id']
    let userName = body['user']['name']

    let title = blocks[1]["text"]["text"]

    blocks[4]["accessory"]["text"]["text"] = "Admitido"
    blocks[6] = {
        "type": "actions",
        "elements": [{
            "type": "button",
            "action_id": "markInProgress",
            "text": {
                "type": "plain_text",
                "text": "Marcar ticket como en proceso"
            },
            "value": "inProgress"
        }]
    }

    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
    }

    const reqBody = {
        "channel": process.env.SLACK_CHANNEL,
        "ts": timestamp,
        "blocks": blocks
    }

    axios.post("https://slack.com/api/chat.update", reqBody, {
            headers: headers
        })
        .then((res) => {
            return String(res.status) == "200"
        })


});

//Listen for Investigating Button
app.action('markInProgress', async({
    ack,
    body,
    say,
    context
}) => {

    await ack();

    let blocks = body['message']['blocks']
    let timestamp = body['message']["ts"]
    let userID = body['user']['id']
    let userName = body['user']['name']

    let title = blocks[1]["text"]["text"]

    blocks[4]["accessory"]["text"]["text"] = "En proceso"
    blocks[6] = {
        "type": "actions",
        "elements": [{
            "type": "button",
            "action_id": "markResolved",
            "text": {
                "type": "plain_text",
                "text": "Marcar ticket como resuelto"
            },
            "value": "resolved"
        }]
    }

    let timeOptions = {
        "type": "section",
        "block_id": "timeSpent",
        "text": {
            "type": "mrkdwn",
            "text": "*Tiempo de resolución del ticket:*"
        },
        "accessory": {
            "type": "static_select",
            "placeholder": {
                "type": "plain_text",
                "text": "Selecciona una opción",
                "emoji": true
            },
            "action_id": "timeSpentOption",
            "options": []
        }
    }

    let timeWorked = [
        ["5 mins", 0.1],
        ["15 mins", 0.25],
        ["30 mins", 0.5],
        ["45 mins", 0.75],
        ["1 hr", 1],
        ["2 hrs", 2],
        ["3 hrs", 3],
        ["4 hrs", 4],
        ["6 hrs", 6],
        ["12 hrs", 12],
        ["18 hrs", 18],
        ["24+ hrs", 24]
    ];
    let timeOption;
    for (let i = 0; i < timeWorked.length; i++) {
        timeOption = {
            "text": {
                "type": "plain_text",
                "text": timeWorked[i][0],
                "emoji": true
            },
            "value": timeWorked[i][1].toString()
        }
        timeOptions["accessory"]["options"].push(timeOption);


    }

    blocks.splice(6, 0, timeOptions)

    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
    }

    const reqBody = {
        "channel": process.env.SLACK_CHANNEL,
        "ts": timestamp,
        "blocks": blocks
    }

    axios.post("https://slack.com/api/chat.update", reqBody, {
            headers: headers
        })
        .then((res) => {
            return String(res.status) == "200"
        })


});

//Listen for Resolved Button
app.action('markResolved', async({
    ack,
    body,
    say,
    context
}) => {

    await ack();

    var blocks = body['message']['blocks']
    var timestamp = body['message']["ts"]
    var userID = body['user']['id']
    var userName = body['user']['name']

    var userReported = blocks[8]["elements"][0]["text"]

    var userReportedID = userReported.substring(
        userReported.lastIndexOf("@") + 1,
        userReported.lastIndexOf(">")
    );

    var title = blocks[1]["text"]["text"]

    resolveMessage(timestamp, process.env.SLACK_CHANNEL, blocks, userID)
        // resolveIncidentDatabase(timestamp, userName)
        // Message the user
    try {
        await app.client.chat.postMessage({
            token: context.botToken,
            channel: userReportedID,
            text: "Your incident" + title + " was marked as resolved!"
        });
    } catch (error) {
        console.error(error);
    }

});


app.event('app_mention', ({
    event,
    say,
    context
}) => {

    // Only deal with a message that contains 'hi'
    if (/assign/i.test(event["text"]) && event["thread_ts"]) {

        let re = new RegExp("/(?<=<@).*?(?=>)/g");
        let matches = event["text"].match(/(?<=<@).*?(?=>)/g)
        matches.shift()

        messageAssigned(matches, event["thread_ts"], process.env.SLACK_CHANNEL, context);
        newIncidentResponsible(event["thread_ts"], matches)

    }
});


async function messageAssigned(users, timestamp, channel, context) {

    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    axios.get("https://slack.com/api/chat.getPermalink?token=" + process.env.SLACK_BOT_TOKEN + "&channel=" + channel + "&message_ts=" + timestamp, {
            headers: headers
        })
        .then((res) => {

            console.log(res["data"])

            if (res["data"]["ok"]) {
                for (let i = 0; i < users.length; ++i) {
                    app.client.chat.postMessage({
                        token: context.botToken,
                        channel: users[i],
                        text: "You have been assigned a new incident! \n" + res["data"]["permalink"]
                    });
                }
            }

        })

}

async function newIncident(title, description, service) {
    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagerduty+json;version=2',
        'From': process.env.PAGERDUTY_EMAIL,
        'Authorization': 'Token token=' + process.env.PAGERDUTY_SECRET
    }

    const body = {
        "incident": {
            "type": "incident",
            "title": title,
            "service": {
                "id": service,
                "type": "service_reference"
            },
            "body": {
                "type": "incident_body",
                "details": description
            }
        }
    }

    let response = 0;

    await axios.post("https://api.pagerduty.com/incidents", body, {
            headers: headers
        })
        .then((res) => {
            response = res;
        })
    return [String(response.status) == "201", response.data['incident']['incident_number']];
};


function acknowledgeMessage(timestamp, channel, blocks, selected) {

    blocks[4]['accessory'] = {
        "type": "button",
        "text": {
            "type": "plain_text",
            "text": selected,
            "emoji": true
        }
    }
    blocks[6]["accessory"]["text"]["text"] = "Acknowledged"

    const resolveButton = {
        "type": "actions",
        "elements": [{
            "type": "button",
            "action_id": "markInvestigating",
            "text": {
                "type": "plain_text",
                "text": "Mark as investigating"
            },
            "value": "resolved"
        }]
    }

    blocks.splice(7, 0, resolveButton)

    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
    }

    const body = {
        "channel": channel,
        "ts": timestamp,
        "blocks": blocks
    }

    axios.post("https://slack.com/api/chat.update", body, {
            headers: headers
        })
        .then((res) => {
            return String(res.status) == "200"
        })

    return false;



};

function resolveMessage(timestamp, channel, blocks, user) {

    blocks[4]["accessory"]["text"]["text"] = "Resuelto :heavy_check_mark:"

    let resolvedBy = {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Resuelto por* <@" + user + ">"
        }
    }

    let timeResolved = {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Tiempo de resolución del ticket:*"
        },
        "accessory": {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": selectedTime,
                "emoji": true
            },
            "value": "click_me_123"
        }
    };

    blocks.splice(8, 0, resolvedBy);
    blocks.splice(7, 1);
    blocks.splice(6, 1, timeResolved)

    const axios = require('axios');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN
    }

    const body = {
        "channel": channel,
        "ts": timestamp,
        "blocks": blocks
    }

    axios.post("https://slack.com/api/chat.update", body, {
            headers: headers
        })
        .then((res) => {
            return String(res.status) == "200"
        })
};

/* function newIncidentDatabase(slackTimestamp, title, description, userName, userID){
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let query = "INSERT INTO public.incidents(slack_timestamp,title,description,status,creation_time,reported_by, reported_by_id) VALUES ($1,$2,$3,'PENDING', NOW(),$4, $5);"
  let values = [slackTimestamp, title, description, userName, userID]
  
  pool.query(query, values, (err, res)=>{
    pool.end();
  })
  }
  
  
function acknowledgeIncidentDatabase(slackTimestamp, pagerDutyService, pagerDutyNumber, severity){
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let query = "UPDATE public.incidents SET pagerduty_number = $1, pagerduty_service = $2, acknowledged_time = NOW(), status = 'ACKNOWLEDGED', severity=$3 where slack_timestamp = $4;"
  let values = [pagerDutyNumber, pagerDutyService, severity, slackTimestamp]
  
  pool.query(query, values, (err, res)=>{
    pool.end();
  })
}
  
function resolveIncidentDatabase(slackTimestamp, userName){
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let query = "UPDATE public.incidents SET resolved_time = NOW(), status = 'RESOLVED', resolved_by = $1 where slack_timestamp = $2;"
  let values = [userName, slackTimestamp]
  
  pool.query(query, values, (err, res)=>{
    pool.end();
  })
} 
  
function newIncidentResponsible(slackTimestamp, usersResponsibleArray){
  
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  let format = require('pg-format'); //Needed for inserting multiple rows at once
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let queryParameters = [];
  let i;
  for (i=0; i<usersResponsibleArray.length; ++i){
    //getUserInfo(usersResponsibleArray[i])
    queryParameters.push([slackTimestamp, usersResponsibleArray[i]])
  }
  
  let query = format("INSERT INTO public.incident_responsible (slack_timestamp,responsible) VALUES %L", queryParameters);
  console.log(query)
  
  pool.query(query, (err, res)=>{
    console.log(res)
    console.log(err)
    pool.end();
  })
}
  
function newIncidentApplication(slackTimestamp, applicationsAffected){
    // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  let format = require('pg-format'); //Needed for inserting multiple rows at once
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let queryParameters = [];
  let i;
  for (i=0; i<applicationsAffected.length; ++i){
    queryParameters.push([slackTimestamp, applicationsAffected[i]])
  }
  
  let query = format("INSERT INTO public.incident_application (slack_timestamp,application_affected) VALUES %L", queryParameters);
  
  pool.query(query, (err, res)=>{
    console.log(err)
    pool.end();
  })
}
  
function newIncidentUserAffected(slackTimestamp, usersAffected){
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  let format = require('pg-format'); //Needed for inserting multiple rows at once
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
  
  let queryParameters = [];
  let i;
  for (i=0; i<usersAffected.length; ++i){
    queryParameters.push([slackTimestamp, usersAffected[i]])
  }
  
  let query = format("INSERT INTO public.incident_user (slack_timestamp,user_affected) VALUES %L", queryParameters);
  
  pool.query(query, (err, res)=>{
    console.log(err)
    pool.end();
  })
}
  
app.command('/updateusers', async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();
  
  const axios = require('axios');
  
  const headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
  }
  
  axios.get("https://slack.com/api/users.list?token=" + process.env.SLACK_BOT_TOKEN, {headers: headers})
  .then((res)=>{
    
    console.log(res["data"])
    
    let members = res["data"]["members"];
    let memberInfo = [];
    
    for (let i=0; i<members.length; ++i){
      memberInfo.push([members[i]["id"], members[i]["name"], members[i]["profile"]["real_name_normalized"], members[i]["deleted"]])
  }
    
  // Declare a new client instance from Pool()
  const Pool = require("pg").Pool;
  let format = require('pg-format'); //Needed for inserting multiple rows at once
  
  const pool = new Pool({
    user: process.env.POSTGRES_USERNAME,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: "5432"
  });
    
  let query = format("INSERT INTO public.slack_users (slack_id, slack_name, name, deleted) VALUES %L ON CONFLICT (slack_id) DO UPDATE SET slack_name = EXCLUDED.slack_name, name = EXCLUDED.name, deleted = EXCLUDED.deleted", memberInfo);
  
  pool.query(query, (err, res)=>{
    console.log(err)
    pool.end();
  })
  })
  
      
      
  });
  
*/

(async() => {
    // Start your app
    await app.start(process.env.PORT || 4000);

    console.log('⚡️ Bolt app is running!');
    console.log('Current channel is: ' + process.env.SLACK_CHANNEL)
})();