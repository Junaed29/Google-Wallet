const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// TODO: Define issuer ID
let issuerId = '3388000000022346589';
let classSuffix = 'TestClass02';
let objectSuffix = 'TestObject02';
const objectId = `${issuerId}.${objectSuffix}`;
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/path/to/key.json';

const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

const credentials = require(keyFilePath);

const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
});

// Updated Generic pass object according to new template
let genericObject = {
  'id': `${objectId}`,
  'classId': `${issuerId}.${classSuffix}`,
  'genericType': 'GENERIC_TYPE_UNSPECIFIED',
  'logo': {
    'sourceUri': {
      'uri': 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
    },
    'contentDescription': {
      'defaultValue': {
        'language': 'en-US',
        'value': 'LOGO_IMAGE_DESCRIPTION'
      }
    }
  },
  'cardTitle': {
    'defaultValue': {
      'language': 'en-US',
      'value': 'Test 1'
    }
  },
  'subheader': {
    'defaultValue': {
      'language': 'en-US',
      'value': 'Attendee'
    }
  },
  'header': {
    'defaultValue': {
      'language': 'en-US',
      'value': 'Juaed'
    }
  },
  'textModulesData': [
    {
      'id': 'points',
      'header': 'POINTS',
      'body': '1112'
    },
    {
      'id': 'contacts',
      'header': 'CONTACTS',
      'body': '79'
    },
    {
      'id': 'header',
      'header': 'HEADER',
      'body': 'Somethig'
    },
    {
      'id': 'contacts2',
      'header': 'CONTACTS2',
      'body': '44'
    }
  ],
  'barcode': {
    'type': 'QR_CODE',
    'value': 'BARCODE_VALUE',
    'alternateText': ''
  },
  'hexBackgroundColor': '#4285f4',
  'heroImage': {
    'sourceUri': {
      'uri': 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-hero-demo-only.png'
    },
    'contentDescription': {
      'defaultValue': {
        'language': 'en-US',
        'value': 'HERO_IMAGE_DESCRIPTION'
      }
    }
  }
};

// Check if the object exists already
httpClient.request({
  url: `${baseUrl}/genericObject/${objectId}`,
  method: 'GET',
}).then(response => {
  console.log('Object already exists');
  console.log(response);

  console.log('Object ID');
  console.log(response.data.id);

  // Object exists, update it
  httpClient.request({
    url: `${baseUrl}/genericObject/${objectId}`,
    method: 'PUT',
    data: genericObject,
  }).then(response => {
    console.log('Object update response');
    console.log(response);

    console.log('Object ID');
    console.log(response.data.id);
  }).catch(err => {
    console.log('Error updating object:');
    console.log(err);
  });

}).catch(err => {
  if (err.response && err.response.status === 404) {
    // Object does not exist
    // Create it now
    httpClient.request({
      url: `${baseUrl}/genericObject`,
      method: 'POST',
      data: genericObject,
    }).then(response => {
      console.log('Object insert response');
      console.log(response);

      console.log('Object ID');
      console.log(response.data.id);
    }).catch(err => {
      console.log('Error creating object:');
      console.log(err);
    });
  } else {
    // Something else went wrong
    console.log('Error checking object existence:');
    console.log(err);
  }
});

// Generate JWT for the object
const claims = {
  iss: credentials.client_email, // `client_email` in service account file.
  aud: 'google',
  origins: ['http://localhost:3000'],
  typ: 'savetowallet',
  payload: {
    genericObjects: [genericObject],
  },
};

const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
console.log(token);


// Write the JWT to a text file
const tokenFilePath = './token.txt';
fs.writeFileSync(tokenFilePath, token);
console.log(`JWT saved to ${tokenFilePath}`);
