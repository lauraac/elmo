let moment = require('moment');
moment.locale("es-mx");
let dateText = moment().format('LL');

const formView = {
    "type": "modal",
    "external_id": "view_incidentNew",
    "callback_id": "view_incident",
    "title": {
        "type": "plain_text",
        "text": "Formulario Zubaleros VIP",
        "emoji": true
    },
    "submit": {
        "type": "plain_text",
        "text": "Enviar",
        "emoji": true
    },
    "close": {
        "type": "plain_text",
        "text": "Cancelar",
        "emoji": true
    },
    "blocks": [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": " *Fecha:*  " + dateText
            }
        },
        // {
        //   "type": "input",
        //   "element": {
        //     "type": "datepicker",
        //     "initial_date": date,
        //     "action_id": "selectedDate",
        //     "placeholder": {
        //       "type": "plain_text",
        //       "text": "Select a date",
        //       "emoji": true
        //     }
        //   },
        //   "block_id": "incidentDate",
        //   "label": {
        //     "type": "plain_text",
        //     "text": "Date :calendar:",
        //     "emoji": true
        //   }
        // },
        {
            "type": "input",
            "block_id": "incidentTitle",
            "element": {
                "type": "plain_text_input",
                "action_id": "titleInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Título del incidente"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Título",
                "emoji": true
            }
        },
        {
            "type": "input",
            "optional": true,
            "element": {
                "type": "plain_text_input",
                "action_id": "descriptionInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Descripción del incidente"
                },
                "multiline": true
            },
            "block_id": "incidentDescription",
            "label": {
                "type": "plain_text",
                "text": "Descripción"
            }
        },
        {
            "type": "input",
            "dispatch_action": true,
            "block_id": "requestType",
            "element": {
                "type": "static_select",
                "action_id": "requestTypeInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Seleccione una opción",
                    "emoji": true
                },
                "options": []
            },
            "label": {
                "type": "plain_text",
                "text": "Tipo de solicitud",
                "emoji": true
            }
        },
        {
            "type": "input",
            "optional": true,
            "block_id": "zubaleroName",
            "element": {
                "type": "plain_text_input",
                "action_id": "zubaleroNameInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Nombre del Zubalero"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Nombre completo del Zubalero",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "states",
            "optional": true,
            "element": {
                "type": "static_select",
                "action_id": "statesInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Seleccione una opción",
                    "emoji": true
                },
                "options": []
            },
            "label": {
                "type": "plain_text",
                "text": "Estado",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "clients",
            "element": {
                "type": "static_select",
                "action_id": "clientsInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Seleccione una opción",
                    "emoji": true
                },
                "options": []
            },
            "label": {
                "type": "plain_text",
                "text": "Cliente",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "teamInCharge",
            "element": {
                "type": "static_select",
                "action_id": "teamInChargeInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Seleccione una opción",
                    "emoji": true
                },
                "options": []
            },
            "label": {
                "type": "plain_text",
                "text": "Equipo a cargo",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "priorities",
            "element": {
                "type": "static_select",
                "action_id": "prioritiesInput",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Seleccione una opción",
                    "emoji": true
                },
                "options": []
            },
            "label": {
                "type": "plain_text",
                "text": "Prioridad",
                "emoji": true
            }
        },
    ]
};

const requestType = [
    "Alta",
    "Baja",
    "Cobertura de Vacantes",
    "Modificación de salario",
    "Solicitud de carta",
    "Solicitud AFIL",
    "Nómina",
    "Pago por nómina extraordinaria",
    "Consultas de pago erróneo u omisión",
    "Otro"
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
    "Zacatecas"
];

const clients = [
    "Autozone",
    "Grupo modelo",
    "Oxxo",
    "Rabbit",
    "Sello rojo",
    "Multi Marca",
    "Otro"
];

const teamInCharge = [
    "RH",
    "Nómina",
    "Reclutamiento",
    "Otro"
];

const priorities = [
    "Alta",
    "Media",
    "Baja"
];

const blocksPostMessage = [{
        "type": "divider"
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": ""
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": ""
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Estado actual del ticket:*"
        },
        "accessory": {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": "Pendiente",
                "emoji": true
            },
            "value": "click_me_123"
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "actions",
        "elements": [{
            "type": "button",
            "action_id": "markAdmitted",
            "text": {
                "type": "plain_text",
                "text": "Marcar ticket como admitido"
            },
            "value": "admitted"
        }]
    },
    {
        "type": "context",
        "elements": [{
            "type": "mrkdwn",
            "text": ""
        }]
    }
];

module.exports = {
    formView,
    requestType,
    states,
    clients,
    teamInCharge,
    priorities,
    blocksPostMessage
};