# Socket Chat App Simulation Backend

This is the backend for a real-time chat application built with Node.js, Express, and Socket.IO.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js
*   npm
*   MongoDB

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/repo_name.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following environment variables:
    ```
    JWT_ACCESS_SECRET=your_jwt_access_secret
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    DB_URL=your_mongodb_connection_string
    CLIENT_URL=http://localhost:3001
    ```
4.  Start the server
    ```sh
    npm start
    ```

## API Endpoints

The base URL for the APIs is: `https://chat-backend-enexabit.vercel.app`

### Auth

*   **POST** `/auth/signup`

    Registers a new user.

    **Request Body:**

    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```

    **Responses:**

    *   `201 Created`:
        ```json
        {
          "message": "user added",
          "userAdded": {
            "_id": "60d0fe4f5311236168a109ca",
            "name": "John Doe",
            "email": "john.doe@example.com"
          }
        }
        ```
    *   `200 OK` (if user already exists):
        ```json
        {
          "message": "user already exist"
        }
        ```

*   **POST** `/auth/login`

    Logs in a user and returns an access token.

    **Request Body:**

    ```json
    {
      "email": "john.doe@example.com",
      "password": "password123"
    }
    ```

    **Responses:**

    *   `200 OK`:
        ```json
        {
          "message": "login success",
          "accessToken": "your_access_token",
          "userId": "60d0fe4f5311236168a109ca"
        }
        ```
    *   `401 Unauthorized`:
        ```json
        {
          "message": "email or password are incorrect"
        }
        ```

*   **POST** `/auth/refresh-token`

    Refreshes an access token using the refresh token stored in a cookie.

    **Responses:**

    *   `200 OK`:
        ```json
        {
          "message": "token refreshed",
          "accessToken": "your_new_access_token",
          "userId": "60d0fe4f5311236168a109ca"
        }
        ```
    *   `401 Unauthorized`:
        ```json
        {
          "message": "refresh token is required"
        }
        ```

*   **POST** `/auth/logout`

    Logs out the user by clearing the refresh token cookie.

    **Responses:**

    *   `200 OK`:
        ```json
        {
          "message": "logout success"
        }
        ```

### Users

*   **GET** `/users`

    Returns a list of all users except the currently authenticated user. Requires authentication.

    **Responses:**

    *   `200 OK`:
        ```json
        {
          "message": "success",
          "users": [
            {
              "_id": "60d0fe4f5311236168a109cb",
              "name": "Jane Doe",
              "email": "jane.doe@example.com"
            }
          ]
        }
        ```

### Messages

*   **POST** `/messages`

    Creates a new message. Requires authentication.

    **Request Body:**

    ```json
    {
      "content": "Hello, world!",
      "receiverId": "60d0fe4f5311236168a109cb",
      "roomId": "your_room_id"
    }
    ```

    **Responses:**

    *   `201 Created`:
        ```json
        {
          "message": "success",
          "newMessage": {
            "_id": "60d0fe4f5311236168a109cc",
            "content": "Hello, world!",
            "senderId": "60d0fe4f5311236168a109ca",
            "receiverId": "60d0fe4f5311236168a109cb",
            "roomId": "your_room_id",
            "createdAt": "2023-10-27T10:00:00.000Z"
          }
        }
        ```

*   **GET** `/messages/:roomId`

    Returns all messages for a specific room. Requires authentication.

    **Responses:**

    *   `200 OK`:
        ```json
        {
          "message": "success",
          "messages": [
            {
              "_id": "60d0fe4f5311236168a109cc",
              "content": "Hello, world!",
              "senderId": "60d0fe4f5311236168a109ca",
              "receiverId": "60d0fe4f5311236168a109cb",
              "roomId": "your_room_id",
              "createdAt": "2023-10-27T10:00:00.000Z"
            }
          ]
        }
        ```

## Socket.IO Events

### Connection

*   `connection`: Fired when a client connects to the server.

### Room Management

*   `joinRoom`: The client sends this event to join a specific room.
    *   **Payload**: `roomId` (string) - The ID of the room to join.

*   `leaveRoom`: The client sends this event to leave a specific room.
    *   **Payload**: `roomId` (string) - The ID of the room to leave.

### Messaging

*   `sendMessage`: The client sends this event to send a message to a room.
    *   **Payload**:
        ```json
        {
          "roomId": "your_room_id",
          "message": "Hello, world!",
          "senderId": "60d0fe4f5311236168a109ca"
        }
        ```
    *   The server then emits a `receiveMessage` event to all clients in that room.

*   `receiveMessage`: The server sends this event to clients in a room when a new message is sent.
    *   **Payload**:
        ```json
        {
          "roomId": "your_room_id",
          "message": "Hello, world!",
          "senderId": "60d0fe4f5311236168a109ca"
        }
        ```

### Typing Indicators

*   `typingIndicator`: The client sends this event when the user starts typing.
    *   **Payload**:
        ```json
        {
          "roomId": "your_room_id"
        }
        ```
    *   The server then emits an `isTyping` event to other clients in the room.

*   `isTyping`: The server sends this event to clients in a room to indicate that a user is typing.

*   `notTyping`: The client sends this event when the user stops typing.
    *   **Payload**:
        ```json
        {
          "roomId": "your_room_id"
        }
        ```
    *   The server then emits an `isNotTyping` event to other clients in the room.

*   `isNotTyping`: The server sends this event to clients in a room to indicate that a user has stopped typing.
