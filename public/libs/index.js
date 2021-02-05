//Imports
'use strict';
global.fetch = require('node-fetch');
require('dotenv').config();
const AWS = require('aws-sdk');
const jwt_decode = require('jwt-decode');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { CognitoUser } = require('amazon-cognito-identity-js');

//awsConfig.js
let cognitoAttributeList = [];

const poolData = {
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID,
    ClientId : process.env.AWS_COGNITO_CLIENT_ID
};

const attributes = (key, value) => {
    return {
        Name : key,
        Value : value
    }
};

function setCognitoAttributeList(email, agent) {
    let attributeList = [];
    attributeList.push(attributes('email',email));
    attributeList.forEach(element => {
        cognitoAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute(element));
    });
}

function getCognitoAttributeList() {
    return cognitoAttributeList;
}

function getCognitoUser(email) {
    const userData = {
        Username : email,
        Pool: getUserPool()
    };
    return new AmazonCognitoIdentity.CognitoUser(userData);
}


function getUserPool(){
    return new AmazonCognitoIdentity.CognitoUserPool(poolData);
}

function getAuthDetails(email, password){
    var authenticationData = {
        Username: email,
        Password : password,
    }
    return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
}

function initAWS (region = process.env.AWS_COGNITO_REGION, identityPoolId = process.env.AWS_COGNITO_IDENTITY_POOL_ID) {
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
    });
}

function decodeJWTToken(token){
    const { email, exp, auth_time, token_use, sub} = jwt_decode(token.idToken);
    return {token, email, exp, uid: sub, auth_time, token_use};
}
//Cognito
function failureCallback(error) {
    console.log("It failed with " + error);
}

function signIn(email, password) {
    return new Promise((resolve) => {
        getCognitoUser(email).authenticateUser(getAuthDetails(email, password), { 
        onSuccess: (result) => {
            const token = {
                accessToken: result.getAccessToken().getJwtToken(),
                idToken: result.getIdToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken(),
            }

            return resolve({ statusCode: 201, response: decodeJWTToken(token)});
        },

        onFailure: (err) => {
            return resolve({statusCode: 400, response: err.message || JSON.stringify(err)});
        },
        });
    }).catch(failureCallback);
}


exports.handler = async function SignIn(event) {
    const email = event.email;
    const password = event.password;

    const response = await signIn(email,password);
    if (response.statusCode != 400){
        return {
            'statusCode': 200,
            'body':JSON.stringify(response)
        }
    }else{
        return response;
    }
}