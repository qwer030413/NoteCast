import { CognitoUserPool } from "amazon-cognito-identity-js";
const poolData = {
    UserPoolId: "us-east-2_oHdmf5rj9",
    ClientId: "1ok7cgcfgmmeg2n8tnkt4rlj6e"
}


export default new CognitoUserPool(poolData);