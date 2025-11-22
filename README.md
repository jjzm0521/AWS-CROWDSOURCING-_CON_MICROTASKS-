# PROYECTO 29: PLATAFORMA DE CROWDSOURCING CON MICROTASKS

## Descripción
Este proyecto consiste en desarrollar una plataforma tipo Amazon Mechanical Turk donde requesters publican microtareas (etiquetar imágenes, transcribir audio, validar datos), workers las completan y reciben pago, con sistema de quality control y dispute resolution.

## Arquitectura AWS
La solución utiliza una arquitectura Serverless en AWS:

*   **Frontend**: React hospedado en S3 + CloudFront.
*   **Auth**: Amazon Cognito (Requesters y Workers).
*   **API**: API Gateway + Lambda.
*   **Base de Datos**: Amazon DynamoDB.
*   **Colas y Eventos**: SQS, EventBridge.
*   **Quality Control**: Amazon SageMaker (ML), Amazon Rekognition, Amazon Transcribe.
*   **Workflows**: AWS Step Functions (Dispute Resolution).
*   **Notificaciones**: Amazon SES.

## Estructura del Proyecto

```
.
├── backend/                # Lógica del backend (AWS Lambda - Python)
│   ├── src/
│   │   ├── handlers/       # Lambda function handlers
│   │   │   ├── tasks/      # Gestión de tareas
│   │   │   ├── submissions/# Entrega de trabajo
│   │   │   ├── qc/         # Quality Control
│   │   │   ├── payments/   # Pagos y Wallet
│   │   │   └── disputes/   # Resolución de disputas
│   │   └── shared/         # Código compartido
│   └── requirements.txt    # Dependencias de Python
├── infrastructure/         # Infraestructura como Código (AWS CDK - TypeScript)
│   ├── lib/                # Definición de Stacks
│   ├── bin/                # Entry point de la app CDK
│   └── cdk.json            # Configuración CDK
├── frontend/               # Aplicación Web (React - Placeholder)
└── docs/                   # Documentación adicional
```

## Servicios Principales

1.  **Tasks & Submissions**: DynamoDB + Lambda.
2.  **Quality Control**: SageMaker, Rekognition, Manual Review.
3.  **Payments**: DynamoDB (Wallet simulation) + Lambda.
4.  **Disputes**: Step Functions workflow.

## Setup Inicial

Revisar las carpetas `infrastructure` y `backend` para instrucciones específicas de despliegue y desarrollo.
