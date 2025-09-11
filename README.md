## Project info

**url lovable**: https://lovable.dev/projects/0572cd57-6ba5-4465-aea4-d634c12bdeb9

**url para a aplicação publicada:** https://github.com/veronicamedeiros/excel-cert-sender.git

**código do fluxo em N8N**: 

{
  "name": "Envio de Certificados",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "8be520f9-c423-4e1c-833c-3b1b6ac0e83b",
        "options": {
          "allowedOrigins": "*"
        }
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        32,
        0
      ],
      "id": "e1fb4c5d-c655-4047-bee1-046695e2a4fd",
      "name": "Webhook - Recebe dados da planilha",
      "webhookId": "8be520f9-c423-4e1c-833c-3b1b6ac0e83b"
    },
    {
      "parameters": {
        "fieldToSplitOut": "body",
        "options": {}
      },
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [
        224,
        0
      ],
      "id": "4d30b282-37b6-4dfa-9309-29627ca2bbf2",
      "name": "Split Out - Separa dados por pessoa"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "21b5549b-15b4-45b8-bdc4-132a1bc3214e",
              "name": "Nome",
              "value": "={{ $json.Nome\n    .toUpperCase()\n    .replace(/COPY OF\\s*/g, '')      // \"COPY OF \" ou \"COPY OF\" sem espaço\n    .replace(/COPY\\s*/g, '')         // \"COPY \" ou \"COPY\" junto\n    .replace(/C[ÓO]PIA DE\\s*/g, '')  // \"CÓPIA DE \" ou \"CÓPIA DE\"\n    .replace(/-?\\s*COPY/g, '')       // \"COPY\", \" COPY\", \"-COPY\"\n    .replace(/-?\\s*C[ÓO]PIA/g, '')   // \"CÓPIA\", \" CÓPIA\", \"-CÓPIA\"\n    .trim()\n}}",
              "type": "string"
            },
            {
              "id": "0f0dbd18-d289-469e-bfd8-bc198b5d01d7",
              "name": "CPF",
              "value": "={{ \n  $json.CPF\n    .toString()\n    .padStart(11, '0')\n    .replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4')\n}}",
              "type": "string"
            },
            {
              "id": "8d170241-abb0-48fa-ae9d-51e388443675",
              "name": "Telefone",
              "value": "={{ \n(() => {\n  const rawInput = $json.Telefone;\n  if (rawInput === undefined || rawInput === null) return null;\n\n  // garante string e remove tudo que não é dígito\n  const str = String(rawInput).replace(/\\D/g, \"\");\n  if (!str) return null;\n\n  // remove código do país se já existir, assim padroniza para DDD + telefone\n  let rest = str.startsWith(\"55\") ? str.slice(2) : str;\n\n  // esperamos DDD (2) + telefone (8 ou 9) -> o resultado deve ter 10 ou 11 dígitos\n  if (!(rest.length === 10 || rest.length === 11)) return null;\n\n  const ddd = rest.slice(0, 2);\n  let telefone = rest.slice(2); // restante após o DDD\n\n  // normaliza:\n  //  - se tiver 8 dígitos -> prefixa 9\n  if (telefone.length === 8) {\n    telefone = \"9\" + telefone;\n  } else if (telefone.length === 9 && !telefone.startsWith(\"9\")) {\n    telefone = \"9\" + telefone.slice(1);\n  }\n\n  return \"55\" + ddd + telefone;\n})()\n}}",
              "type": "string"
            },
            {
              "id": "4de7b9f3-1661-47a5-9b6c-55edbc8c8973",
              "name": "E-mail",
              "value": "={{ $json['E-mail'].trim() }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        432,
        0
      ],
      "id": "fb0f9a9a-f98c-4d23-bb6f-eb15c0823bba",
      "name": "Formata dados"
    },
    {
      "parameters": {
        "operation": "Add Text/Images to PDF",
        "url": "=https://drive.google.com/file/d/1AFAWr_HT78WgHJWA07VGkEaaVwo9OZ3P/view?usp=sharing",
        "annotations": {
          "metadataValues": [
            {
              "text": "={{ $json.Nome }}",
              "x": "500",
              "y": "210",
              "fontName": "Arial",
              "width": 0,
              "height": 0
            },
            {
              "text": "={{ $json.CPF }}",
              "x": "505",
              "y": "232",
              "fontName": "Arial",
              "width": 0,
              "height": 0
            },
            {
              "text": "={{ $now.format('dd/MM/yyyy') }}",
              "x": "420",
              "y": "322",
              "fontName": "Arial",
              "width": 0,
              "height": 0
            }
          ]
        },
        "advancedOptions": {
          "name": "CERTIFICADO Acelera Rio"
        }
      },
      "type": "n8n-nodes-pdfco.PDFco Api",
      "typeVersion": 1,
      "position": [
        640,
        0
      ],
      "id": "1b46371e-8dc6-475d-96c6-41a8e348b2c9",
      "name": "PDFco Api - Aplica dados ao certificado",
      "credentials": {
        "pdfcoApi": {
          "id": "QrOSfGQiySsAxzz6",
          "name": "PDF.co account"
        }
      },
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "sendTo": "certifcadon8n@gmail.com",
        "subject": "Seu certificado chegou!",
        "emailType": "text",
        "message": "=Olá, {{ $('Formata dados').item.json.Nome }}!\n\nSeu certificado chegou, compartilhe essa conquista!",
        "options": {
          "attachmentsUi": {
            "attachmentsBinary": [
              {}
            ]
          }
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1024,
        0
      ],
      "id": "6454301b-c119-4cc4-bcf3-fbc7a1e0045b",
      "name": "Envia o certificado de cada pessoa",
      "webhookId": "dbba74e0-0480-4c7a-b521-836a02eb6e0e",
      "credentials": {
        "gmailOAuth2": {
          "id": "iS4MkkIGVBm1ktvg",
          "name": "Gmail account"
        }
      }
    },
    {
      "parameters": {
        "url": "={{ $json.url }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        832,
        0
      ],
      "id": "c7553efe-0450-4d1b-8a03-44dcd1ebe26d",
      "name": "HTTP Request - Baixa o certificado",
      "executeOnce": false,
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "operation": "send",
        "phoneNumberId": "={{ '843873762136243' }}",
        "recipientPhoneNumber": "={{ $('Formata dados').item.json.Nome }}",
        "textBody": "=Olá, {{ $('Formata dados').item.json.Nome }}! \nSeu certificado foi enviado ao seu e-mail, confira e compartilhe.",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.whatsApp",
      "typeVersion": 1,
      "position": [
        1264,
        0
      ],
      "id": "5d2ae532-fe3b-454f-935f-d30e33b5f0c8",
      "name": "Envia mensagem avisanso sobre o e-mail.",
      "webhookId": "418b6356-8660-4d1c-a9ad-7a3b32606c77",
      "credentials": {
        "whatsAppApi": {
          "id": "BPXDRJyJb4lMb2LD",
          "name": "WhatsApp account 2"
        }
      },
      "onError": "continueRegularOutput"
    }
  ],
  "pinData": {},
  "connections": {
    "Webhook - Recebe dados da planilha": {
      "main": [
        [
          {
            "node": "Split Out - Separa dados por pessoa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Out - Separa dados por pessoa": {
      "main": [
        [
          {
            "node": "Formata dados",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Formata dados": {
      "main": [
        [
          {
            "node": "PDFco Api - Aplica dados ao certificado",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "PDFco Api - Aplica dados ao certificado": {
      "main": [
        [
          {
            "node": "HTTP Request - Baixa o certificado",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "HTTP Request - Baixa o certificado": {
      "main": [
        [
          {
            "node": "Envia o certificado de cada pessoa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "af8ccc18-2e2a-4248-acd9-b73055e2092f",
  "meta": {
    "instanceId": "2f5bbdda6506703f5ba7fc031fc16a17103a88a48928bf0f2bafdc883116df82"
  },
  "id": "qhXhBAqtmILpcT8P",
  "tags": []
}
