import boto3
from decimal import Decimal

# CONFIGURACIÓN
REGION = 'us-east-1'
# REEMPLAZA ESTO CON EL NOMBRE REAL DE TU TABLA (mirar output de CDK o DynamoDB Console)
WALLETS_TABLE_NAME = 'CrowdsourcingDataStack-WalletsTable-REPLACE_ME'
# REEMPLAZA ESTO CON EL ID (sub) DEL USUARIO REQUESTER (sacado de Cognito o del Dashboard)
REQUESTER_ID = 'tu-user-id-uuid-aqui'
AMOUNT = 100.00

def fund_wallet():
    dynamodb = boto3.resource('dynamodb', region_name=REGION)
    table = dynamodb.Table(WALLETS_TABLE_NAME)

    print(f"Inyectando ${AMOUNT} a la billetera de {REQUESTER_ID}...")

    try:
        # Usamos UPDATE para sumar saldo (o crearlo si no existe)
        response = table.update_item(
            Key={'walletId': REQUESTER_ID},
            UpdateExpression="ADD balance :amount",
            ExpressionAttributeValues={
                ':amount': Decimal(str(AMOUNT))
            },
            ReturnValues="UPDATED_NEW"
        )
        print("¡Éxito! Nuevo saldo:", response['Attributes']['balance'])

    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    fund_wallet()
