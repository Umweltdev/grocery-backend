# INTRODUCTION
This documentation describes how to use the Romax Ecommerce Restful API, enabling the retrieval and manipulation of data.The API follows standard protocols for authorization and response data types to ensure secure and consistent communication between the frontend and backend.

## 1. Auth Endpoints: 
The Auth Endpoints is responsible for seamless account creation, secure logins, and personalized experiences for users.
### 1.1 Signup
* HTTP Method: POST
* URL: api/user/register
* Description: This endpoint is responsible for enabling the registration of new users into the system.
* Access: Public
* Content-Type: application/json
* Request Body:  
   * fullName(string,required):  The user’s full name.
   * email(string,required):  The user’s email address.
   * phone(string,required):  The user’s phone number.
   * password(string,required): The user’s desired password

```json
 {
     "fullName": "Sharon Billy",
      "email": "sharonbilly001@yahoo.com",
      "phone": "081345624420",
      "password" : "00000000"
      
 }
```
    
* Responses Body:  
    * A JSON object containing information about the logged in user and  a token(A JSON Web Token (JWT) that can be used to authenticate the user for future requests).
    

```json
{
    "_id": "64ebadea6a259f5202bbb171",
    "fullName": "sharon billy",
    "role": "user",
    "email": "sharonbilly001@yahoo.com",
    "phone": "081345624420",
    "orders": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWJhZGVhNmEyNTlmNTIwMmJiYjE3MSIsImlhdCI6MTY5MzE2NzA4MiwiZXhwIjoxNjkzMjUzNDgyfQ.oGYEiqyYQt2OWFhJC6zyE34bB8N3Tf-eLI0CGTb3bKw"
}
```

* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 409(Conflict): A user with the provided email/phone-number already exists.
    * 500(Internal Error): An unexpected error occurred on the server.

### 1.2 Login
* HTTP Method: POST
* URL: api/user/login
* Description: Authenticate a registered user.
* Access: Public
* Content-Type: application/json
* Request Body:  
    * email or phone (string,required):  The email or phone number associated with the user account.
    * password(string,required): The user’s  password.

```json
{
    "emailOrPhone": "sharonbilly001@yahoo.com",
    "password": "00000000"
}
```
* Responses Body:  
    * A JSON object containing information about the logged in user and a token (A JSON Web Token (JWT) that can be used to authenticate the user for future requests.).

```json
{
    "_id": "64ebadea6a259f5202bbb171",
    "fullName": "sharon billy",
    "role": "user",
    "email": "sharonbilly001@yahoo.com",
    "phone": "081345624420",
    "orders": 0,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZWJhZGVhNmEyNTlmNTIwMmJiYjE3MSIsImlhdCI6MTY5MzE2NzIzOSwiZXhwIjoxNjkzMjUzNjM5fQ.1kUD3OKyvIynRRvV074XEAa9Tjhcn-vb4TGSlHWF3q8"
}
```
* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 401(Unauthorized): The user credentials are invalid.
    * 500(Internal Error): An unexpected error occurred on the server.

### 1.3 Forgot Password
* HTTP Method: POST
* URL: api/user/forgot-password
* Description: This endpoint allows users to initiate the forgot password process by providing their registered email address.
* Access: Public
* Content-Type: application/json
* Request Body:  
    * email(string,required):  The email address associated with a user's account.
* Responses Body:  If the email address is valid and associated with a user account, the API will return a 200 OK response code with a message indicating that an email has been sent to the user's email address with instructions for resetting their password.
* Error Responses: 
    * 400(Bad Request): The request body contains invalid data.
    * 404(Not found): The provided email address is not associated with any user account.
    * 500(Internal Error): An unexpected error occurred on the server.


### 1.4 Reset Password
* HTTP Method: PUT
* URL: api/user/reset-password/:token
* Description: This endpoint allows users to reset their password.
* Access: Public
* Content-Type: application/json
* Path Parameter:
    * token(string,required): The reset password token sent to the user's email address.
* Request Body:  
    * password(string,required): The user's new password.
* Responses Body:  
    * If the password reset is successful, the API will return a 200 OK response code with a message indicating that the password has been reset.
* Error Responses: 
    * 400(Bad Request): The request body contains invalid data.
    * 404(Not found): The provided token is not valid.
    * 500(Internal Error): An unexpected error occurred on the server.

## 2. User Endpoints: 
The user endpoints are responsible for managing user accounts, including creation, retrieval, update, and deletion. Some endpoints are publicly accessible, while others require authentication and authorization. Regular users have limited access to certain endpoints, while admin users have full access to all endpoints and resources in the application.
### 2.1 Read User Profile
* HTTP Method: GET
* URL: api/user
* Description: This endpoint  returns information about the logged in user.
* Access: Private/Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Responses Body:  
    * When the authentication is successful, the API will respond with a 200 OK status code and return a JSON object containing details about the logged in user.

```json
{
    "_id": "64ebadea6a259f5202bbb171",
    "fullName": "sharon billy",
    "email": "sharonbilly001@yahoo.com",
    "phone": "081345624420",
    "wishlist": [],
    "role": "user",
    "orderCount": 0
}
```
* Error Responses: 
    * 401(Unauthorized): The user is not authenticated or the provided access token is invalid.
    * 500(Internal Error): An unexpected error occurred on the server.

### 2.2 Update  User Profile
* HTTP Method: PUT
* URL: api/user
* Description: This endpoint allows logged in users to update their profile.
* Access: Private/Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Content-type: multipart/form
* Request Body:  
    * fullName(string,optional):  The user’s full name.
    * email(string,optional):  The user’s email address.
    * phone(string,optional):  The user’s phone number.
    * dob(string in ISO format, optional): The user's date of birth in ISO format (e.g., "YYYY-MM-DD").
    * image(file,optional): The user’s profile picture
* Responses Body:  
    * If the update is successful, the API will return a 200 response code with a JSON object that contains the updated user's information.

```json
{
    "_id": "645fcb647a4600ff787d35ea",
    "fullName": "ridwan abdulsalam",
    "role": "user",
    "dob": "1995-05-29T07:00:00.000Z",
    "email": "riliwanademola@yahoo.com",
    "phone": "803456212300",
    "orders": 2,
    "image": "https://res.cloudinary.com/daghax01m/image/upload/v1689509304/romax/sd5qgv8t2fxtbdcm9cdh.jpg",
    
}
```
* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 401(Unauthorized): The user is not authenticated or the provided access token is invalid.
    * 500(Internal Error): An unexpected error occurred on the server.

### 2.3 Read All Users
* HTTP Method: GET
* URL: api/user/get-users
* Description: This endpoint returns a list of all users in the database. Only the admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Responses Body:  
    * If a user with the admin role makes a successful request to this endpoint, the API will respond with a 200 OK status code and return a JSON object that includes array of all users in the database.

```json
[
    {
        "image": {
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689509304/romax/sd5qgv8t2fxtbdcm9cdh.jpg",
            "public_id": "romax/sd5qgv8t2fxtbdcm9cdh"
        },
        "_id": "645fcb647a4600ff787d35ea",
        "email": "riliwanademola@yahoo.com",
        "phone": "803456212300",
        "dob": "1995-05-29T07:00:00.000Z",
        "role": "admin",
        "createdAt": "2023-05-13T17:39:48.635Z",
        "updatedAt": "2023-07-25T04:46:07.315Z",
        "__v": 1,
        "orderCount": 82,
        "fullName": "ridwan abdulsalam"
    },
    {
        "image": {
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1690118293/romax/e5lglodxlilwne9m91jq.jpg",
            "public_id": "romax/e5lglodxlilwne9m91jq"
        },
        "_id": "6460b67eef98d6f029c0fa00",
        "email": "mashcaranojnr@gmail.com",
        "phone": "7000000000",
        "dob": "2000-09-13T07:00:00.000Z",
        "role": "user",
        "createdAt": "2023-05-14T10:22:54.580Z",
        "updatedAt": "2023-08-10T03:50:46.519Z",
        "__v": 0,
        "fullName": "neymar junior",
        "orderCount": 17
    },
    
    {
        "_id": "64af1adf0f20824f715a5dc2",
        "fullName": "junior mashcarano",
        "email": "finance1@raoatech.com",
        "phone": "0000000000",
        "role": "user",
        "orderCount": 0,
        "createdAt": "2023-07-12T21:27:59.996Z",
        "updatedAt": "2023-07-12T21:27:59.996Z",
        "__v": 0
    },
    {
        "image": {
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689706237/romax/fasfy5iivbu3v9z2qibc.jpg",
            "public_id": "romax/fasfy5iivbu3v9z2qibc"
        },
        "_id": "64b63d298163f481a18d5073",
        "fullName": "anabell zuck",
        "email": "riliwanademola12@yahoo.com",
        "phone": "081243967534",
        "role": "user",
        "orderCount": 0,
        "createdAt": "2023-07-18T07:20:09.968Z",
        "updatedAt": "2023-07-19T02:50:29.793Z",
        "__v": 0,
        "dob": "1976-01-29T08:00:00.000Z"
    },
    {
        "_id": "64bad7d2f0d05c11866d3b70",
        "fullName": "john micheal",
        "email": "riliwanademola1235@yahoo.com",
        "phone": "090345678934",
        "role": "admin",
        "orderCount": 0,
        "createdAt": "2023-07-21T19:09:06.113Z",
        "updatedAt": "2023-07-21T19:09:06.113Z",
        "__v": 0
    },
    {
        "_id": "64ebadea6a259f5202bbb171",
        "fullName": "sharon billy",
        "email": "sharonbilly001@yahoo.com",
        "phone": "081345624420",
        "role": "user",
        "orderCount": 0,
        "createdAt": "2023-08-27T20:11:22.511Z",
        "updatedAt": "2023-08-27T20:11:22.511Z",
        "__v": 0
    }
]

```
* Error Responses: 
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 500(Internal Error): An unexpected error occurred on the server.

### 2.4 Read A User by ID
* HTTP Method: GET
* URL: api/user/:id
* Description: This endpoint returns information about a user with the specified id. Only authenticated users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Path Parameter: 
    * id(string,required): The ID of the user to retrieve.
* Responses Body:  
    * If the request is successful, the API will return a 200 OK response code with a JSON object that contains information about the user.

```json
{
        "image": {
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1690118293/romax/e5lglodxlilwne9m91jq.jpg",
            "public_id": "romax/e5lglodxlilwne9m91jq"
        },
        "_id": "6460b67eef98d6f029c0fa00",
        "email": "mashcaranojnr@gmail.com",
        "phone": "7000000000",
        "dob": "2000-09-13T07:00:00.000Z",
        "role": "user",
        "createdAt": "2023-05-14T10:22:54.580Z",
        "updatedAt": "2023-08-10T03:50:46.519Z",
        "__v": 0,
        "fullName": "neymar junior",
        "orderCount": 17
    },
```
* Error Responses: 
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found): The user with the specified id  does not exist in the database.
    * 500(Internal Error): An unexpected error occurred on the server.

### 2.5 Delete User by ID
* HTTP Method: DELETE
* URL: api/user/:id
* Description: This endpoint deletes a user with the specified id. Only authenticated users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Path Parameter: 
    * id(string): The ID of the user to be deleted.
* Responses Body:  
    * If the request is successful, the API will return a 204 code with a JSON object that contains information about the user that was deleted.


```json
{
        "image": {
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1690118293/romax/e5lglodxlilwne9m91jq.jpg",
            "public_id": "romax/e5lglodxlilwne9m91jq"
        },
        "_id": "6460b67eef98d6f029c0fa00",
        "email": "mashcaranojnr@gmail.com",
        "phone": "7000000000",
        "dob": "2000-09-13T07:00:00.000Z",
        "role": "user",
        "createdAt": "2023-05-14T10:22:54.580Z",
        "updatedAt": "2023-08-10T03:50:46.519Z",
        "__v": 0,
        "fullName": "neymar junior",
        "orderCount": 17
    },
```
* Error Responses: 
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found): The user with the specified id  does not exist in the database.
    * 500(Internal Error): An unexpected error occurred on the server.

### 2.6 Update User by ID
* HTTP Method: PUT
* URL: api/admin/user/:id
* Description: This endpoint updates a user with the specified id. Only authenticated users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
    * Content-type: multipart/form
* Path Parameter: 
    * id(string): The ID of the user to be updated.
* Request Body:  
    * firstName(string,optional):  The user’s first name.
    * lastName(string,optional):  The user’s last name.
    * email(string,optional):  The user’s email address.
    * phone(string,optional):  The user’s phone number.
    * dob(string in ISO format, optional): The user's date of birth in ISO format (e.g., "YYYY-MM-DD").
    * image(file,optional): The user’s profile picture
* Response Body:  
    * If the request is successful, the API will return a 204 code with a JSON object that contains information about the user that was updated.
* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found): The user with the specified id  does not exist in the database.
    * 500(Internal Error): An unexpected error occurred on the server.
### 2.7 Get Wishlist
* HTTP Method: GET
* URL: api/user
* Description: This endpoint retrieves products that have been added to the user's wishlist.
* Access: Private/Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Responses Body:  
    * When the authentication is successful, the response contains array of products that the user has added to their wishlist where each product is represented as an object with relevant details such as product ID, name, image URL, and other attributes.

```json
{
    "_id": "645fcb647a4600ff787d35ea",
    "wishlist": [
        {
            "reStock": false,
            "_id": "64acf1a4d9ed15939571e317",
            "productId": "#823d1321",
            "name": "U.S T-Shirt",
            "slug": "u.s-t-shirt",
            "description": "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum,sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n",
            "isFeatured": false,
            "published": false,
            "regularPrice": 16500,
            "salePrice": null,
            "stock": 11,
            "sold": 11,
            "tags": [
                "fashion,men,trending"
            ],
            "category": "64b460c9d32f97a5b4164255",
            "brand": "6488ca317c9244821429e6c8",
            "images": [
                {
                    "public_id": "romax/ociuayplass1rw1bsdz4",
                    "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689161447/romax/ociuayplass1rw1bsdz4.jpg",
                    "_id": "64aeff61b03cb070ba0b29b7"
                },
                {
                    "public_id": "romax/nxnuxkw8rvdhodwaqr93",
                    "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689161449/romax/nxnuxkw8rvdhodwaqr93.jpg",
                    "_id": "64aeff61b03cb070ba0b29b8"
                }
            ],
            "totalrating": 4,
            "totalstar": 0,
            "ratings": [
                {
                    "star": 4,
                    "comment": " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                    "postedby": "6460b67eef98d6f029c0fa00",
                    "_id": "64b0dc42a075ee3678ebefca"
                }
            ],
            "createdAt": "2023-07-11T06:07:32.620Z",
            "updatedAt": "2023-08-10T03:50:46.526Z",
            "__v": 0
        },
        {
            "isFeatured": false,
            "_id": "64acf0a3d9ed15939571e2f3",
            "productId": "#da038559",
            "name": "Native T-Shirt!!",
            "slug": "native-t-shirt!!",
            "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "published": true,
            "regularPrice": 24000,
            "salePrice": 21000,
            "stock": 0,
            "sold": 0,
            "tags": [
                "fashion,men,trending"
            ],
            "category": "64aba044e05eba54a52df1c1",
            "brand": "6488ca0d7c9244821429e6c4",
            "images": [
                {
                    "public_id": "romax/i1ktkpfqq9klscpixgij",
                    "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689292701/romax/i1ktkpfqq9klscpixgij.jpg",
                    "_id": "64b100185cf142cefddb3849"
                },
                {
                    "public_id": "romax/eha7tuc6xlsfzstsamqh",
                    "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689292705/romax/eha7tuc6xlsfzstsamqh.jpg",
                    "_id": "64b100185cf142cefddb384b"
                }
            ],
            "totalrating": 2,
            "totalstar": 0,
            "ratings": [
                {
                    "star": 2,
                    "comment": " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                    "postedby": "6460b67eef98d6f029c0fa00",
                    "_id": "64b0dc5ba075ee3678ebeff1"
                }
            ],
            "createdAt": "2023-07-11T06:03:15.303Z",
            "updatedAt": "2023-08-10T04:00:16.764Z",
            "__v": 0,
            "reStock": true
        }
    ]
}
```
* Error Responses: 
    * 401(Unauthorized): The user is not authenticated or the provided access token is invalid.
    * 500(Internal Error): An unexpected error occurred on the server.
## 3. Category Endpoints: 
The category endpoints provide functionalities for creating, reading, updating, and deleting categories in the database.Each category can have a parent category, and sub-categories can be nested beneath a parent category. However, certain operations such as creating, updating, and deleting of categories can only be performed by authenticated users with admin roles.
### 3.1 Create Category
* HTTP Method: POST
* URL: api/category
* Description: This endpoint is used to add a new category to the database, Only authenticated users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
    * Content-type: multipart/form
* Request Body:  
    * name(string,required):  The  name of category.
    * parent(string,optional):  The ID of the parent category, if any.
    * image(file,optional): The category’s image.

```json
{
 "name": "Men Accessories",
 "parent": "64aba044e05eba54a52df1c1"
}
```
* Responses Body:  
    * If the request is successful, the API will return a 201  response code with a JSON object that contains the details of the new category.

```json
{
    "categoryId": "#df23ffe8",
    "name": "Men Accessories",
    "parent": "64aba044e05eba54a52df1c1",
    "children": [],
    "level": 2,
    "visible": true,
    "_id": "64ec0459a61f6fce4ce1f19b",
    "createdAt": "2023-08-28T02:20:09.725Z",
    "updatedAt": "2023-08-28T02:20:09.725Z",
    "__v": 0
}
```
* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found):  The parent category ID is invalid.
    * 500(Internal Error): An unexpected error occurred on the server.

### 3.2 Read all Categories
* HTTP Method: GET
* URL: api/category
* Description: This endpoint retrieves a comprehensive list of all categories stored within the database, considering query parameters if provided.
* Access: Public
* Query Parameter: 
    * level(string,optional): The level of the categories to be retrieve.
    * visible(boolean,optional): Determines whether the category visibility should be taken into account, indicating whether categories should be shown or not.
* Responses Body:  
    * The API will respond with a 200 OK status code and return a JSON array that includes all categories in the database, also considering query parameters if provided.

```json
[
    {
        "_id": "64b34d30d32f97a5b416333e",
        "categoryId": "#1f6bb1c6",
        "name": "Teens Boys",
        "parent": "64aba044e05eba54a52df1c1",
        "children": [
            {
                "_id": "64b46099d32f97a5b416423e",
                "categoryId": "#0eddd09a",
                "name": "12 - 18 Age",
                "parent": "64b34d30d32f97a5b416333e",
                "children": [
                    {
                        "_id": "64b460c9d32f97a5b4164255",
                        "categoryId": "#15998447",
                        "name": "Shirts",
                        "parent": "64b46099d32f97a5b416423e",
                        "children": [],
                        "level": 4,
                        "visible": true,
                        "createdAt": "2023-07-16T21:27:37.315Z",
                        "updatedAt": "2023-07-16T21:27:37.315Z",
                        "__v": 0
                    }
                ],
                "level": 3,
                "visible": true,
                "createdAt": "2023-07-16T21:26:49.435Z",
                "updatedAt": "2023-07-16T21:27:37.318Z",
                "__v": 1
            }
        ],
        "level": 2,
        "visible": true,
        "createdAt": "2023-07-16T01:51:44.198Z",
        "updatedAt": "2023-07-16T21:26:49.448Z",
        "__v": 1
    },
    {
        "_id": "64b5a64d8163f481a18d3f43",
        "categoryId": "#b33a55da",
        "name": "Adults",
        "parent": "64aba044e05eba54a52df1c1",
        "children": [],
        "level": 2,
        "visible": true,
        "createdAt": "2023-07-17T20:36:29.620Z",
        "updatedAt": "2023-07-17T20:36:29.620Z",
        "__v": 0
    },
    {
        "_id": "64bad8e3f0d05c11866d3c73",
        "categoryId": "#fe2a4bda",
        "image": {
            "public_id": "romax/opii3zbiknyf4zrvzqul",
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1689938026/romax/opii3zbiknyf4zrvzqul.jpg"
        },
        "name": "Men Shirts",
        "parent": "64aba044e05eba54a52df1c1",
        "children": [],
        "level": 2,
        "visible": true,
        "createdAt": "2023-07-21T19:13:39.499Z",
        "updatedAt": "2023-07-21T19:13:39.499Z",
        "__v": 0
    },
    {
        "_id": "64ec0459a61f6fce4ce1f19b",
        "categoryId": "#df23ffe8",
        "name": "Men Accessories",
        "parent": "64aba044e05eba54a52df1c1",
        "children": [],
        "level": 2,
        "visible": true,
        "createdAt": "2023-08-28T02:20:09.725Z",
        "updatedAt": "2023-08-28T02:20:09.725Z",
        "__v": 0
    }
]
```
* Error Responses: 
    * 500(Internal Error): An unexpected error occurred on the server.

### 3.3 Read Category by ID
* HTTP Method: GET
* URL: api/category/:categoryId
* Description: This endpoint returns  a category with the specified id in the database.
* Access: Public
* Path Parameter: 
    * categoryId(string,required): The ID of the category to retrieve.
* Responses Body:  
    * The API will respond with a 200 OK status code and return a JSON object representing the category with the specified ID in the database.

```json
{
    "_id": "64ec0459a61f6fce4ce1f19b",
    "categoryId": "#df23ffe8",
    "name": "Men Accessories",
    "parent": {
        "image": {
            "public_id": "romax/nefyfwonv1haujmpaguy",
            "url": "https://res.cloudinary.com/daghax01m/image/upload/v1688940494/romax/nefyfwonv1haujmpaguy.jpg"
        },
        "_id": "64aba044e05eba54a52df1c1",
        "categoryId": "#4a1f5815",
        "name": "Men Clothes",
        "children": [
            "64b34d30d32f97a5b416333e",
            "64b5a64d8163f481a18d3f43",
            "64bad8e3f0d05c11866d3c73",
            "64ec0459a61f6fce4ce1f19b"
        ],
        "level": 1,
        "visible": true,
        "createdAt": "2023-07-10T06:08:04.967Z",
        "updatedAt": "2023-08-28T02:20:09.735Z",
        "__v": 4
    },
    "children": [],
    "level": 2,
    "visible": true,
    "createdAt": "2023-08-28T02:20:09.725Z",
    "updatedAt": "2023-08-28T02:20:09.725Z",
    "__v": 0
}
```
* Error Responses:
    * 500(Internal Error): An unexpected error occurred on the server.

### 3.4 Update Category by ID
* HTTP Method: PUT
* URL: api/category/:categoryId
* Description: This endpoint updates a category with the specified id. Only users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
* Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Content-type: multipart/form
* Path Parameter: 
    * categoryId(string): The id of the category to update.
* Request Body:  
    * name(string,required):  The  name of category.
    * parent(string,optional):  The ID of the parent category, if any.
    * image(file,optional): The user’s profile picture
* Response Body:  
    * If the request is successful, the API will return a 204 code with a JSON object that contains information about the category that was updated.
* Error Responses: 
    * 400(Bad Request): The request body is missing one or more required fields or contains invalid data.
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found): The category with the specified id  does not exist in the database.
    * 500(Internal Error): An unexpected error occurred on the server.

### 3.5 Delete Category by ID
* HTTP Method: DELETE
* URL: api/category/:categoryId
* Description: This endpoint deletes a category with the specified id. Only users with the role of admin can access this endpoint.
* Access: Admin
* Request Header: 
    * Authorization(string): The JWT access token obtained after a successful login. Must be set to Bearer <token>.
* Path Parameter: 
    * categoryId(string): The ID of the category to delete.
* Responses Body:  
    * If the request is successful, the API will return a 204 code with a JSON object that contains information about the category that was deleted.
* Error Responses: 
    * 401(Unauthorized): The user is not authorized/authenticated to access this endpoint.
    * 403(Forbidden): The user does not have the admin role.
    * 404(Not Found): The category with the specified id  does not exist in the database.
    * 500(Internal Error): An unexpected error occurred on the server.
