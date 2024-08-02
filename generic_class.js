const { GoogleAuth } = require('google-auth-library');

// TODO: Define issuer ID
let issuerId = '3388000000022346589';
let classSuffix = 'TestClass02';
const classId = `${issuerId}.${classSuffix}`;
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/path/to/key.json';

const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

const credentials = require(keyFilePath);

const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
});

// Updated Generic pass class according to new template
let genericClass = {
  'id': `${classId}`,
    'cardTemplateOverride': {
      'cardRowTemplateInfos': [
        {
          'twoItems': {
            'startItem': {
              'firstValue': {
                'fields': [
                  {
                    'fieldPath': 'object.textModulesData["points"]',
                  },
                ],
              },
            },
            'endItem': {
              'firstValue': {
                'fields': [
                  {
                    'fieldPath': 'object.textModulesData["contacts"]',
                  },
                ],
              },
            },
          },
        },
        {
          'twoItems': {
            'startItem': {
              'firstValue': {
                'fields': [
                  {
                    'fieldPath': 'object.textModulesData["header"]',
                  },
                ],
              },
            },
            'endItem': {
              'firstValue': {
                'fields': [
                  {
                    'fieldPath': 'object.textModulesData["contacts2"]',
                  },
                ],
              },
            },
          },
        },
      ],
    }, 
};

// Check if the class exists already
httpClient.request({
  url: `${baseUrl}/genericClass/${classId}`,
  method: 'GET',
}).then(response => {
  console.log('Class already exists');
  console.log(response);

  console.log('Class ID');
  console.log(response.data.id);

  // Class exists, update it
  httpClient.request({
    url: `${baseUrl}/genericClass/${classId}`,
    method: 'PUT',
    data: genericClass,
  }).then(response => {
    console.log('Class update response');
    console.log(response);

    console.log('Class ID');
    console.log(response.data.id);
  }).catch(err => {
    console.log('Error updating class:');
    console.log(err);
  });

}).catch(err => {
  if (err.response && err.response.status === 404) {
    // Class does not exist
    // Create it now
    httpClient.request({
      url: `${baseUrl}/genericClass`,
      method: 'POST',
      data: genericClass,
    }).then(response => {
      console.log('Class insert response');
      console.log(response);

      console.log('Class ID');
      console.log(response.data.id);
    }).catch(err => {
      console.log('Error creating class:');
      console.log(err);
    });
  } else {
    // Something else went wrong
    console.log('Error checking class existence:');
    console.log(err);
  }
});
