// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
let moment = require("moment");
let {
    formView,
    states,
    clients,
    requestType,
    teamInCharge,
    priorities,
    blocksPostMessage,
} = require("./data");

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});
let result,
    selectedTime = "";

// All the room in the world for your code
moment.locale("es-mx");

let today = new Date();
// let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
let date = moment().format("YYYY-MM-DD");
let dateText = moment().format("LL");

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
app.command("/elmo", async({ ack, payload, context }) => {
    // Acknowledge the command request
    ack();

    if (formView["blocks"][4]["block_id"] == "movementDate") {
        formView["blocks"].splice(4, 1);

        // console.log(formView["blocks"][4]);
    }

    //RequestType
    formView["blocks"][3]["element"]["options"].length === 0 ?
        fillFields(requestType, 3) :
        console.log("");
    //States
    formView["blocks"][5]["element"]["options"].length === 0 ?
        fillFields(states, 5) :
        console.log("");
    //Clients
    formView["blocks"][6]["element"]["options"].length === 0 ?
        fillFields(clients, 6) :
        console.log("");
    //Team in charge
    formView["blocks"][7]["element"]["options"].length === 0 ?
        fillFields(teamInCharge, 7) :
        console.log("");
    //Priority
    formView["blocks"][8]["element"]["options"].length === 0 ?
        fillFields(priorities, 8) :
        console.log("");

    try {
        result = await app.client.views.open({
            token: context.botToken,
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: payload.trigger_id,
            // View payload
            view: formView,
        });
    } catch (error) {
        console.error(error);
    }
});

// Handle a view_submission event
app.view("view_incident", async({ ack, body, view, context }) => {
    // Acknowledge the view_submission event

    await ack();

    const title = view["state"]["values"]["incidentTitle"]["titleInput"]["value"];
    let description =
        view["state"]["values"]["incidentDescription"]["descriptionInput"][
            "value"
        ] != null ?
        view["state"]["values"]["incidentDescription"]["descriptionInput"][
            "value"
        ] :
        "";
    // const date = view['state']['values']['incidentDate']['selectedDate']['selected_date'];
    const userID = body["user"]["id"];
    const userName = body["user"]["name"];
    const requestTypes =
        view["state"]["values"]["requestType"]["requestTypeInput"][
            "selected_option"
        ]["text"]["text"];
    let dateMovement = "";

    if (formView["blocks"][4]["block_id"] == "movementDate") {
        dateMovement =
            view["state"]["values"]["movementDate"]["movementDateInput"][
                "selected_option"
            ]["text"]["text"];
    }

    console.log(dateMovement);

    let zubaleroName =
        view["state"]["values"]["zubaleroName"]["zubaleroNameInput"]["value"] !=
        null ?
        view["state"]["values"]["zubaleroName"]["zubaleroNameInput"]["value"] :
        "";
    let state =
        view["state"]["values"]["states"]["statesInput"]["selected_option"] != null ?
        view["state"]["values"]["states"]["statesInput"]["selected_option"][
            "text"
        ]["text"] :
        "";
    const client =
        view["state"]["values"]["clients"]["clientsInput"]["selected_option"][
            "text"
        ]["text"];
    const team =
        view["state"]["values"]["teamInCharge"]["teamInChargeInput"][
            "selected_option"
        ]["text"]["text"];
    const priority =
        view["state"]["values"]["priorities"]["prioritiesInput"]["selected_option"][
            "text"
        ]["text"];

    // Message to send user

    let msg = "";

    msg = "Your submission for *" + title + "* was successful";

    blocksPostMessage[2]["text"]["text"] =
        "*Fecha:* " +
        date +
        (description != "" ? "\n\n*Descripción:* \n" + description : "") +
        "\n\n*Tipo de solicitud:* " +
        requestTypes +
        (dateMovement != "" ? "\n\n*Fecha de movimiento:* " + dateMovement : "") +
        (zubaleroName != "" ? "\n\n*Nombre del Zubalero:* " + zubaleroName : "") +
        (state != "" ? "\n\n*Estado:* " + state : "") +
        "\n\n*Cliente:* " +
        client +
        "\n\n*Equipo a cargo:* " +
        team +
        "\n\n*Prioridad:* " +
        priority;

    blocksPostMessage[1]["text"]["text"] = " *" + title + "*";

    blocksPostMessage[6]["elements"][0]["text"] =
        "Reportado por: <@" + userID + ">";

    try {
        const result = await app.client.chat.postMessage({
            token: context.botToken,
            channel: process.env.SLACK_CHANNEL,
            text: `New incident submitted!`,
            blocks: blocksPostMessage,
        });

        let timestamp = result["ts"];
    } catch (error) {
        console.error(error);
    }

    // Message the user
    try {
        await app.client.chat.postMessage({
            token: context.botToken,
            channel: userID,
            text: msg,
        });
    } catch (error) {
        console.error(error);
    }
});

//Request Type selected
app.action(
    "requestTypeInput",
    async({ ack, body, say, view, context, payload }) => {
        await ack();

        // let form = formView;
        let blocks = formView["blocks"];

        // console.log(blocks);
        const requestTypes = body["actions"][0]["selected_option"]["text"]["text"];
        let template = {
            type: "input",
            block_id: "movementDate",
            element: {
                type: "static_select",
                action_id: "movementDateInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [{
                        text: {
                            type: "plain_text",
                            text: "Mayor a 5 días hábiles",
                            emoji: true,
                        },
                        value: "higher",
                    },
                    {
                        text: {
                            type: "plain_text",
                            text: "No mayor a 5 días hábiles",
                            emoji: true,
                        },
                        value: "notHigher",
                    },
                ],
            },
            label: {
                type: "plain_text",
                text: "Fecha del movimiento",
                emoji: true,
            },
        };

        if (requestTypes == "Alta") {
            blocks.splice(4, 0, template);
        } else if (blocks[4]["block_id"] == "movementDate") {
            blocks.splice(4, 1);
        }

        try {
            const resultT = await app.client.views.update({
                token: context.botToken,
                // Pass a valid trigger_id within 3 seconds of receiving it
                trigger_id: payload.trigger_id,
                // View payload
                view: formView,
                view_id: result["view"]["id"],
            });
        } catch (error) {
            console.error(error);
        }
    }
);

const removeShowTimeResolved = (body, blocks) => {
    if (
        body["message"]["blocks"][6]["type"] == "section" &&
        body["message"]["blocks"][7]["type"] == "actions"
    ) {
        blocks.splice(6, 1);
        blocks.splice(6, 1);
    } else if (
        body["message"]["blocks"][6]["type"] == "section" &&
        body["message"]["blocks"][7]["type"] == "context"
    ) {
        blocks.splice(6, 1);
    }
};

//Listen for status dropdown
app.action("actualStatus", async({ ack, body, say }) => {
    await ack();

    let blocks = body["message"]["blocks"];
    let title = blocks[1]["text"]["text"];
    let description = blocks[2]["text"]["text"];
    let selectedStatus = body["actions"][0]["selected_option"]["text"]["text"];
    let timestamp = body["message"]["ts"];
    let idencificador = 0;

    if (selectedStatus == "Admitido") {
        removeShowTimeResolved(body, blocks);
    } else if (selectedStatus == "En proceso") {
        removeShowTimeResolved(body, blocks);
    } else if (selectedStatus == "Resuelto") {
        let timeOptions = {
            type: "section",
            block_id: "timeSpent",
            text: {
                type: "mrkdwn",
                text: "*Tiempo de resolución del ticket:*",
            },
            accessory: {
                type: "static_select",
                placeholder: {
                    type: "plain_text",
                    text: "Selecciona una opción",
                    emoji: true,
                },
                action_id: "timeSpentOption",
                options: [],
            },
        };

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
            ["24+ hrs", 24],
        ];
        let timeOption;
        for (let i = 0; i < timeWorked.length; i++) {
            timeOption = {
                text: {
                    type: "plain_text",
                    text: timeWorked[i][0],
                    emoji: true,
                },
                value: timeWorked[i][1].toString(),
            };
            timeOptions["accessory"]["options"].push(timeOption);
        }

        blocks.splice(6, 0, timeOptions);
    }

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const reqBody = {
        channel: process.env.SLACK_CHANNEL,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", reqBody, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });
});

//Listen for yime dropdown
app.action("timeSpentOption", async({ ack, body, say, context }) => {
    await ack();
    let timestamp = body["message"]["ts"];
    let selected = body["actions"][0]["selected_option"]["text"]["text"];
    let blocks = body["message"]["blocks"];
    selectedTime = body["actions"][0]["selected_option"]["text"]["text"];

    if (!blocks[8]) {
        let template = {
            type: "actions",
            elements: [{
                type: "button",
                action_id: "markResolved",
                text: {
                    type: "plain_text",
                    text: "Finalizar ticket",
                },
                value: "resolved",
            }, ],
        };

        blocks.splice(7, 0, template);
    }

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const reqBody = {
        channel: process.env.SLACK_CHANNEL,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", reqBody, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });
});

//Listen for Investigating Button
app.action("markInvestigating", async({ ack, body, say, context }) => {
    await ack();

    let blocks = body["message"]["blocks"];
    let timestamp = body["message"]["ts"];
    let userID = body["user"]["id"];
    let userName = body["user"]["name"];

    let title = blocks[1]["text"]["text"];

    blocks[6]["accessory"]["text"]["text"] = "Investigating";
    blocks[7] = {
        type: "actions",
        elements: [{
            type: "button",
            action_id: "markFixing",
            text: {
                type: "plain_text",
                text: "Mark as fixing",
            },
            value: "fixing",
        }, ],
    };

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const reqBody = {
        channel: process.env.SLACK_CHANNEL,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", reqBody, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });
});

//Listen for Fixing Button
app.action("markFixing", async({ ack, body, say, context }) => {
    await ack();

    let blocks = body["message"]["blocks"];
    let timestamp = body["message"]["ts"];
    let userID = body["user"]["id"];
    let userName = body["user"]["name"];

    let title = blocks[1]["text"]["text"];

    blocks[6]["accessory"]["text"]["text"] = "Fixing";
    blocks[7] = {
        type: "actions",
        elements: [{
            type: "button",
            action_id: "markResolved",
            text: {
                type: "plain_text",
                text: "Mark as resolved",
            },
            value: "resolved",
        }, ],
    };

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const reqBody = {
        channel: process.env.SLACK_CHANNEL,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", reqBody, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });
});

//Listen for Resolved Button
app.action("markResolved", async({ ack, body, say, context }) => {
    await ack();

    var blocks = body["message"]["blocks"];
    var timestamp = body["message"]["ts"];
    var userID = body["user"]["id"];
    var userName = body["user"]["name"];

    var userReported = blocks[8]["elements"][0]["text"];

    var userReportedID = userReported.substring(
        userReported.lastIndexOf("@") + 1,
        userReported.lastIndexOf(">")
    );

    var title = blocks[1]["text"]["text"];

    resolveMessage(timestamp, process.env.SLACK_CHANNEL, blocks, userID);
    // resolveIncidentDatabase(timestamp, userName)

    // Message the user
    try {
        await app.client.chat.postMessage({
            token: context.botToken,
            channel: userReportedID,
            text: "Your incident" + title + " was marked as resolved!",
        });
    } catch (error) {
        console.error(error);
    }
});

app.event("app_mention", ({ event, say, context }) => {
    // Only deal with a message that contains 'hi'
    if (/assign/i.test(event["text"]) && event["thread_ts"]) {
        let re = new RegExp("/(?<=<@).*?(?=>)/g");
        let matches = event["text"].match(/(?<=<@).*?(?=>)/g);
        matches.shift();

        messageAssigned(
            matches,
            event["thread_ts"],
            process.env.SLACK_CHANNEL,
            context
        );
        newIncidentResponsible(event["thread_ts"], matches);
    }
});

async function messageAssigned(users, timestamp, channel, context) {
    const axios = require("axios");

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    axios
        .get(
            "https://slack.com/api/chat.getPermalink?token=" +
            process.env.SLACK_BOT_TOKEN +
            "&channel=" +
            channel +
            "&message_ts=" +
            timestamp, {
                headers: headers,
            }
        )
        .then((res) => {
            console.log(res["data"]);

            if (res["data"]["ok"]) {
                for (let i = 0; i < users.length; ++i) {
                    app.client.chat.postMessage({
                        token: context.botToken,
                        channel: users[i],
                        text: "You have been assigned a new incident! \n" +
                            res["data"]["permalink"],
                    });
                }
            }
        });
}

async function newIncident(title, description, service) {
    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/vnd.pagerduty+json;version=2",
        From: process.env.PAGERDUTY_EMAIL,
        Authorization: "Token token=" + process.env.PAGERDUTY_SECRET,
    };

    const body = {
        incident: {
            type: "incident",
            title: title,
            service: {
                id: service,
                type: "service_reference",
            },
            body: {
                type: "incident_body",
                details: description,
            },
        },
    };

    let response = 0;

    await axios
        .post("https://api.pagerduty.com/incidents", body, {
            headers: headers,
        })
        .then((res) => {
            response = res;
        });
    return [
        String(response.status) == "201",
        response.data["incident"]["incident_number"],
    ];
}

function acknowledgeMessage(timestamp, channel, blocks, selected) {
    blocks[4]["accessory"] = {
        type: "button",
        text: {
            type: "plain_text",
            text: selected,
            emoji: true,
        },
    };
    blocks[6]["accessory"]["text"]["text"] = "Acknowledged";

    const resolveButton = {
        type: "actions",
        elements: [{
            type: "button",
            action_id: "markInvestigating",
            text: {
                type: "plain_text",
                text: "Mark as investigating",
            },
            value: "resolved",
        }, ],
    };

    blocks.splice(7, 0, resolveButton);

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const body = {
        channel: channel,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", body, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });

    return false;
}

function resolveMessage(timestamp, channel, blocks, user) {
    let resolvedBy = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Resuelto por* <@" + user + ">",
        },
    };

    let actualStatus = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Estado actual:*",
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                text: "Resuelto :heavy_check_mark:",
                emoji: true,
            },
            value: "click_me_123",
        },
    };

    let timeResolved = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Tiempo de resolución del ticket:*",
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                text: selectedTime,
                emoji: true,
            },
            value: "click_me_123",
        },
    };

    blocks.splice(8, 0, resolvedBy);
    blocks.splice(7, 1);
    blocks.splice(4, 1, actualStatus);
    blocks.splice(5, 1, timeResolved);
    blocks.splice(6, 1);

    const axios = require("axios");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_BOT_TOKEN,
    };

    const body = {
        channel: channel,
        ts: timestamp,
        blocks: blocks,
    };

    axios
        .post("https://slack.com/api/chat.update", body, {
            headers: headers,
        })
        .then((res) => {
            return String(res.status) == "200";
        });
}

(async() => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
    console.log("Current channel is: " + process.env.SLACK_CHANNEL);
})();