# Restaurant API

## Introduction

This is a mock up of an API for a pizza restaurant. However, it is possible to modify it for other types of establishments that lets the customer chose aspects of a product. (e.g. ingredients for a sandwich)

The API is built on HTTP, is RESTful, and it:

-  Uses predictable, resource-oriented URLs.
-  Uses built-in HTTP capabilities for passing parameters and authentication.
-  Responds with standard HTTP response codes to indicate errors.
-  Returns JSON.

Our samples from this API Reference provide examples that will function. You’re welcome to copy/paste and run the script to see the API in action.

## Base URL

All API URLs referenced in this documentation start with a base part. To send requests to the staging server use:

```
localhost:3000
```

The initial setting for production is:

```
localhost:5000
```

## Session Authentication

There are various types of requests that require a session token. This token is used to prevent unwanted actions to an individual's user account. Each token is valid for one hour and further details about token requests are in the session tokens section

## Errors

A listing of possible response codes that are returned to the user.

| Code | Description                                          |
| ---- | ---------------------------------------------------- |
| 200  | Everything worked as expected                        |
| 400  | Bad Request - Often missing a required parameter     |
| 403  | The Request is Forbidden                             |
| 404  | Not Found - The requested item doesn’t exist         |
| 405  | The Method of the request is not allowed             |
| 500  | Server Errors - something is wrong on the server end |

## Server Configuration Setup

Inside the lib folder there is a config.js file that needs to be modified in order for the server to send information to Stripe and Mail Gun. The example below is to run the server in staging mode for testing.

```javascript
environments.staging = {
   httpPort: 3000,
   httpsPort: 3001,
   envName: 'staging',
   hashingSecret: 'hashThing1', // Replace with a unique secret for the user's password security
   maxItems: 5, // Maximum amount of items that can be in the user's cart adjust to your personal preference
   stripe: {
      apiKey: 'API_TEST_KEY' // Replace with stripe API key
   },
   mailGun: {
      apiKey: 'API_TEST_KEY', // Replace with Mail Gun API key
      domain: 'API_TEST_DOMAIN' // Replace with Mail Gun sandbox domain.
   }
};
```

## Client Configuration Setup

Inside the public folder there is a app.js file that needs to be modified in order for the server to send information to Stripe and Mail Gun.

```javascript
app.config = {
   sessionToken: false,
   maxItems: 5, // Maximum amount of items that can be in the user's cart adjust to your personal preference
   stripeKey: 'API_PUBLIC_KEY' // Replace with stripe public API key
};
```

## Server Requests

---

> ## User Options
>
> These various requests are for creating, editing, and deleting the user's account.

---

### Create An Account

| POST | localhost:3000/users |
| ---- | -------------------- |


Create a new user account to begin the ordering process.

#### Headers

| Key          | Value            | Description            |
| ------------ | ---------------- | ---------------------- |
| Content-Type | application/json | Format of request body |

#### Body

```javascript
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@mail.com",
    "password": "password",
    "tosAgreement": true,
    "address": {
        "city": "Anytown",
        "state": "CA",
        "streetAddress": "1 Main St.",
        "zipCode": "12345"
    }
}
```

#### Response

```javascript
// empty object
```

---

### Get Account Information

| GET | localhost:3000/users?email=johndoe@mail.com |
| --- | ------------------------------------------- |


Access account information including anything in your order queue

#### Headers

| Key   | Value                | Description         |
| ----- | -------------------- | ------------------- |
| token | awr7j49n8pevw0gz1mun | Login session token |

#### Parameters

| Key   | Value            | Description                 |
| ----- | ---------------- | --------------------------- |
| email | johndoe@mail.com | Email linked to the account |

#### Body

```javascript
// not required
```

#### Response

```javascript
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@mail.com",
    "address": {
        "city": "Anytown",
        "state": "CA",
        "streetAddress": "1 Main St.",
        "zipCode": "12345"
    },
    "tosAgreement": true,
    "cartItems": [
        "c9izig2u4kico5a9sf2s"
    ]
}
```

---

### Edit Account Information

| PUT | localhost:3000/users |
| --- | -------------------- |


Update any personal information except your account email.
Include the account email for the server to accept the changes.

#### Headers

| Key          | Value                | Description            |
| ------------ | -------------------- | ---------------------- |
| Content-Type | application/json     | Format of request body |
| token        | awr7j49n8pevw0gz1mun | Login session token    |

#### Body

```javascript
{
    "email" : "johndoe@mail.com",
    "address" : {
        "city" : "Anytown",
        "state" : "CA",
        "streetAddress" : "1 Main St.",
        "zipCode" : "54321"
    }
}
```

#### Response

```javascript
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@mail.com",
    "address": {
        "city": "Anytown",
        "state": "CA",
        "streetAddress": "1 Main St.",
        "zipCode": "54321"
    },
    "tosAgreement": true
}
```

---

### Delete Account

| DELETE | localhost:3000/users?email=johndoe@mail.com |
| ------ | ------------------------------------------- |


Delete a user account

#### Headers

| Key   | Value                | Description         |
| ----- | -------------------- | ------------------- |
| token | awr7j49n8pevw0gz1mun | Login session token |

#### Parameters

| Key   | Value            | Description                 |
| ----- | ---------------- | --------------------------- |
| email | johndoe@mail.com | Email linked to the account |

#### Body

```javascript
// not required
```

#### Response

```javascript
// empty object
```

---

> ## Session Tokens
>
> These various requests are for creating, editing, and deleting session tokens to verify the user.

---

### Create A Login Token

| POST | localhost:3000/tokens |
| ---- | --------------------- |


Create a session token to access the full features of the API.

#### Headers

| Key          | Value            | Description            |
| ------------ | ---------------- | ---------------------- |
| Content-Type | application/json | Format of request body |

#### Body

```javascript
{
    "email" : "johndoe@mail.com",
    "password" : "password"
}
```

#### Response

```javascript
{
    "email": "johndoe@mail.com",
    "id": "awr7j49n8pevw0gz1mun",
    "expires": 1550087545459
}
```

---

### Look Up A Token

| GET | localhost:3000/tokens?id=awr7j49n8pevw0gz1mun |
| --- | --------------------------------------------- |


Look up a session token in the server

#### Parameters

| Key | Value                | Description         |
| --- | -------------------- | ------------------- |
| id  | awr7j49n8pevw0gz1mun | Login session token |

#### Body

```javascript
// not required
```

#### Response

```javascript
{
    "email": "johndoe@mail.com",
    "id": "awr7j49n8pevw0gz1mun",
    "expires": 1550087545459
}
```

---

### Update A Token

| PUT | localhost:3000/tokens |
| --- | --------------------- |


Extend a token length for another hour

#### Headers

| Key          | Value            | Description            |
| ------------ | ---------------- | ---------------------- |
| Content-Type | application/json | Format of request body |

#### Body

```javascript
{
    "id": "awr7j49n8pevw0gz1mun",
    "extend": true
}
```

#### Response

```javascript
// empty object
```

---

### Destroy A Token (Log Out)

| DELETE | localhost:3000/tokens?id=awr7j49n8pevw0gz1mun |
| ------ | --------------------------------------------- |


Destroy your token in order to prevent unauthorized access of the user's data

#### Parameters

| Key | Value                | Description         |
| --- | -------------------- | ------------------- |
| id  | awr7j49n8pevw0gz1mun | Login session token |

#### Body

```javascript
// not required
```

#### Response

```javascript
// empty object
```

---

> ## Shopping Options
>
> These various requests are for creating, editing, and deleting items within a virtual shopping cart.
> Other options include seeing a menu and purchasing items within the shopping cart

---

### View The Menu

| GET | localhost:3000/menu |
| --- | ------------------- |


See the menu that is stored in the server

#### Parameters

| Key | Value                | Description         |
| --- | -------------------- | ------------------- |
| id  | awr7j49n8pevw0gz1mun | Login session token |

#### Body

```javascript
// not required
```

#### Response

```javascript
{
    "size": {
        "small": {"diameter": "12in", "price": 8.99},
        "medium": {"diameter": "14in", "price": 9.99},
        "large": {"diameter": "16in", "price": 11.99}
    },
    "toppings": {
        "pepperoni": {"price": 0.25},
        "sausage": {"price": 0.25},
        "onions": {"price": 0.10},
        "mushrooms": {"price": 0.10},
        "olives": {"price": 0.10},
        "green_pepper": {"price": 0.10},
        "garlic": {"price": 0.10},
        "tomatoes": {"price": 0.10},
        "spinach": {"price": 0.15},
        "pineapple": {"price": 0.15},
        "ham": {"price": 0.25},
        "bacon": {"price": 0.25},
        "hamburger": {"price": 0.25},
        "extra_cheese": {"price": 0.25}
    }
}
```

---

### Add An Item To The Cart

| POST | localhost:3000/items |
| ---- | -------------------- |


Configure an item and put it within the cart. Each item is provided with an id that can be seen in the cart in the user object. The item id is also used in the requests below.

#### Headers

| Key          | Value                | Description            |
| ------------ | -------------------- | ---------------------- |
| Content-Type | application/json     | Format of request body |
| token        | awr7j49n8pevw0gz1mun | Login session token    |

#### Body

```javascript
{
    "size" : "large",
    "toppings": [
        "olives",
        "pineapple"
    ]
}
```

#### Response

```javascript
{
    "id": "ysfs8yqq1gfg248s4uph",
    "userEmail": "johndoe@mail.com",
    "size": "large",
    "toppings": [
        "olives",
        "pineapple"
    ],
    "price": 12.24
}
```

---

### Get An Item

| GET | localhost:3000/items?id=awr7j49n8pevw0gz1mun |
| --- | -------------------------------------------- |


Retrieve an item from the server by the item identifier.

#### Parameters

| Key | Value                | Description                               |
| --- | -------------------- | ----------------------------------------- |
| id  | ysfs8yqq1gfg248s4uph | Id of the specific item in the users cart |

#### Headers

| Key   | Value                | Description         |
| ----- | -------------------- | ------------------- |
| token | awr7j49n8pevw0gz1mun | Login session token |

#### Body

```javascript
// not required
```

#### Response

```javascript
{
    "id": "ysfs8yqq1gfg248s4uph",
    "userEmail": "johndoe@mail.com",
    "size": "large",
    "toppings": [
        "olives",
        "pineapple"
    ],
    "price": 12.24
}
```

---

### Modify an item

| PUT | localhost:3000/items |
| --- | -------------------- |


Modify an aspect of an item within your cart such as size or toppings or other configurable options. A response is provided showing the changes made.

#### Headers

| Key          | Value                | Description            |
| ------------ | -------------------- | ---------------------- |
| Content-Type | application/json     | Format of request body |
| token        | awr7j49n8pevw0gz1mun | Login session token    |

#### Body

```javascript
{
    "id": "ysfs8yqq1gfg248s4uph",
    "size": "medium"
}
```

#### Response

```javascript
{
    "id": "ysfs8yqq1gfg248s4uph",
    "userEmail": "johndoe@mail.com",
    "size": "medium",
    "toppings": [
        "olives",
        "pineapple"
    ],
    "price": 12.24
}
```

---

### Delete An Item

| DELETE | localhost:3000/items |
| ------ | -------------------- |


Delete and undesired item within the cart using the item id.

#### Headers

| Key          | Value                | Description            |
| ------------ | -------------------- | ---------------------- |
| Content-Type | application/json     | Format of request body |
| token        | awr7j49n8pevw0gz1mun | Login session token    |

#### Body

```javascript
{
    "id": "ysfs8yqq1gfg248s4uph"
}
```

#### Response

```javascript
// empty object
```

---

### Checkout

| POST | localhost:3000/checkout |
| ---- | ----------------------- |


Purchase the items within the car using a Stripe card token. A receipt is sent using Mail Gun and the user is returned the current state of their user object.

#### Headers

| Key          | Value                | Description            |
| ------------ | -------------------- | ---------------------- |
| Content-Type | application/json     | Format of request body |
| token        | awr7j49n8pevw0gz1mun | Login session token    |

#### Body

```javascript
{
	"email" : "johndoe@mail.com",
	"cardToken" : "tok_visa"
}
```

#### Response

```javascript
{
    "userFile": "johndoe-mail-com",
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@mail.com",
    "address": {
        "city": "Anytown",
        "state": "CA",
        "streetAddress": "1 Main St.",
        "zipCode": "12345"
    },
    "cartItems": []
}
```

---
