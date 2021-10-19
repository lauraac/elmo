let moment = require("moment");
moment.locale("es-mx");
let dateText = moment().format("LL");

const formView = {
    type: "modal",
    external_id: "hugoHola",
    callback_id: "view_incident",
    title: {
        type: "plain_text",
        text: "Formulario Zubaleros VIP",
        emoji: true,
    },
    submit: {
        type: "plain_text",
        text: "Enviar",
        emoji: true,
    },
    close: {
        type: "plain_text",
        text: "Cancelar",
        emoji: true,
    },
    blocks: [{
            type: "section",
            text: {
                type: "mrkdwn",
                text: " *Fecha:*  " + dateText,
            },
        },

        {
            type: "input",
            block_id: "incidentTitle",
            element: {
                type: "plain_text_input",
                action_id: "titleInput",
                placeholder: {
                    type: "plain_text",
                    text: "Título del incidente",
                },
            },
            label: {
                type: "plain_text",
                text: "Título",
                emoji: true,
            },
        },
        {
            type: "input",
            optional: true,
            element: {
                type: "plain_text_input",
                action_id: "descriptionInput",
                placeholder: {
                    type: "plain_text",
                    text: "Descripción del incidente",
                },
                multiline: true,
            },
            block_id: "incidentDescription",
            label: {
                type: "plain_text",
                text: "Descripción",
            },
        },
        {
            type: "input",
            dispatch_action: true,
            block_id: "requestType",
            element: {
                type: "static_select",
                action_id: "requestTypeInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [],
            },
            label: {
                type: "plain_text",
                text: "Tipo de solicitud",
                emoji: true,
            },
        },
        {
            type: "input",
            optional: true,
            block_id: "zubaleroName",
            element: {
                type: "plain_text_input",
                action_id: "zubaleroNameInput",
                placeholder: {
                    type: "plain_text",
                    text: "Nombre del Zubalero",
                },
            },
            label: {
                type: "plain_text",
                text: "Nombre completo del Zubalero",
                emoji: true,
            },
        },
        {
            type: "input",
            block_id: "states",
            optional: true,
            element: {
                type: "static_select",
                action_id: "statesInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [],
            },
            label: {
                type: "plain_text",
                text: "Estado",
                emoji: true,
            },
        },
        {
            type: "input",
            block_id: "clients",
            element: {
                type: "static_select",
                action_id: "clientsInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [],
            },
            label: {
                type: "plain_text",
                text: "Cliente",
                emoji: true,
            },
        },
        {
            type: "input",
            block_id: "teamInCharge",
            element: {
                type: "static_select",
                action_id: "teamInChargeInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [],
            },
            label: {
                type: "plain_text",
                text: "Equipo a cargo",
                emoji: true,
            },
        },
        {
            type: "input",
            block_id: "priorities",
            element: {
                type: "static_select",
                action_id: "prioritiesInput",
                placeholder: {
                    type: "plain_text",
                    text: "Seleccione una opción",
                    emoji: true,
                },
                options: [],
            },
            label: {
                type: "plain_text",
                text: "Prioridad",
                emoji: true,
            },
        },
    ],
};

const requestType = [
    "Alta",
    "Baja",
    "Modificación de salario",
    "Solicitud de carta",
    "Solicitud AFIL",
    "Nómina",
    "Pago por nómina extraordinaria",
    "Consultas de pago erróneo u omisión",
    "Otro",
];

const states = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Ciudad de México",
    "Coahuila",
    "Colima",
    "Chiapas",
    "Chihuahua",
    "Durango",
    "Estado de México",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
];

const clients = [
    "Autozone",
    "Grupo modelo",
    "Oxxo",
    "Rabbit",
    "Sello rojo",
    "Otro",
];

const teamInCharge = ["RH", "Nómina", "Otro"];

const priorities = ["Alta", "Media", "Baja"];

const blocksPostMessage = [{
        type: "divider",
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "",
        },
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "",
        },
    },
    {
        type: "divider",
    },
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: "*Estado actual:*",
        },
        accessory: {
            action_id: "actualStatus",
            type: "static_select",
            placeholder: {
                type: "plain_text",
                text: "Pendiente",
            },
            options: [{
                    text: {
                        type: "plain_text",
                        text: "Admitido",
                    },
                    value: "admitted",
                },
                {
                    text: {
                        type: "plain_text",
                        text: "En proceso",
                    },
                    value: "inProgress",
                },
                {
                    text: {
                        type: "plain_text",
                        text: "Resuelto",
                    },
                    value: "resolved",
                },
            ],
        },
    },
    {
        type: "divider",
    },
    {
        type: "context",
        elements: [{
            type: "mrkdwn",
            text: "",
        }, ],
    },
];

module.exports = {
    formView,
    requestType,
    states,
    clients,
    teamInCharge,
    priorities,
    blocksPostMessage,
};