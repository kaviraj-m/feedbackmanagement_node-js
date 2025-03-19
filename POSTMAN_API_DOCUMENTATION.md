# Feedback Management System API Test Documentation

This document provides comprehensive testing documentation for the Feedback Management System API using Postman. It includes all endpoints, required parameters, authentication details, and expected responses.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Department Management](#department-management)
4. [Question Management](#question-management)
5. [Feedback Management](#feedback-management)

## Base URL

All endpoints are relative to the base URL: `http://localhost:8080/api`

## Authentication

Most endpoints require authentication using JWT tokens. After successful login, you'll receive an access token that should be included in the `x-access-token` header for all authenticated requests.

### Register User

- **URL**: `/auth/signup`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "year": 2023,
    "sinNumber": "123456789",
    "departmentId": 1,
    "roles": [1] // Optional: 1=student, 2=staff, 3=academic_director, 4=executive_director
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "User registered successfully with default role"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Required fields missing or duplicate username/email
  - `404 Not Found`: Department not found
  - `500 Internal Server Error`: Server error

### Login User

- **URL**: `/auth/signin`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "johndoe", // Can also use email address
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "year": 2023,
    "sinNumber": "123456789",
    "roles": ["ROLE_STUDENT"],
    "department": {
      "id": 1,
      "name": "Computer Science"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**:
  - `404 Not Found`: User not found
  - `401 Unauthorized`: Invalid password
  - `403 Forbidden`: Account is inactive
  - `500 Internal Server Error`: Server error

## User Management

### Get Current User Profile

- **URL**: `/users/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "year": 2023,
    "sinNumber": "123456789",
    "active": true,
    "roles": [
      {
        "id": 1,
        "name": "student"
      }
    ],
    "department": {
      "id": 1,
      "name": "Computer Science"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `404 Not Found`: User not found
  - `500 Internal Server Error`: Server error

### Get All Users (Admin Only)

- **URL**: `/users/all`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "year": 2023,
      "sinNumber": "123456789",
      "active": true,
      "roles": [...],
      "department": {...}
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get User by ID

- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "year": 2023,
    "sinNumber": "123456789",
    "active": true,
    "roles": [...],
    "department": {...}
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `404 Not Found`: User not found
  - `500 Internal Server Error`: Server error

### Update User

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Required (Own account or Admin)
- **Headers**: `x-access-token: <your_token>`
- **Request Body**:
  ```json
  {
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "year": 2024,
    "sinNumber": "987654321",
    "departmentId": 2,
    "active": true
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "User updated successfully",
    "user": {...}
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: User or department not found
  - `500 Internal Server Error`: Server error

### Delete User (Admin Only)

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "message": "User deleted successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: User not found
  - `500 Internal Server Error`: Server error

### Get Users by Department (Admin Only)

- **URL**: `/users/department/:departmentId`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "year": 2023,
      "sinNumber": "123456789",
      "active": true,
      "roles": [...],
      "department": {...}
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get Users by Year (Admin Only)

- **URL**: `/users/year/:year`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "year": 2023,
      "sinNumber": "123456789",
      "active": true,
      "roles": [...],
      "department": {...}
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

## Department Management

### Create Department

- **URL**: `/departments`
- **Method**: `POST`
- **Authentication**: None (Public endpoint)
- **Request Body**:
  ```json
  {
    "name": "Computer Science",
    "description": "Department of Computer Science and Engineering",
    "active": true,
    "roleId": 1
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "name": "Computer Science",
    "description": "Department of Computer Science and Engineering",
    "active": true,
    "roleId": 1,
    "updatedAt": "2023-06-01T12:00:00.000Z",
    "createdAt": "2023-06-01T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Department name is required or already exists
  - `500 Internal Server Error`: Server error

### Get All Departments

- **URL**: `/departments`
- **Method**: `GET`
- **Authentication**: None (Public endpoint)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Computer Science",
      "description": "Department of Computer Science and Engineering",
      "active": true,
      "roleId": 1,
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z"
    },
    {...}
  ]
  ```
- **Error Response**: `500 Internal Server Error`

### Get Department by ID

- **URL**: `/departments/:id`
- **Method**: `GET`
- **Authentication**: None (Public endpoint)
- **Success Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "Computer Science",
    "description": "Department of Computer Science and Engineering",
    "active": true,
    "roleId": 1,
    "createdAt": "2023-06-01T12:00:00.000Z",
    "updatedAt": "2023-06-01T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Department not found
  - `500 Internal Server Error`: Server error

### Update Department (Admin Only)

- **URL**: `/departments/:id`
- **Method**: `PUT`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Request Body**:
  ```json
  {
    "name": "Computer Science and Engineering",
    "description": "Updated department description",
    "active": true
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Department was updated successfully."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Department with this name already exists
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Department not found
  - `500 Internal Server Error`: Server error

### Delete Department (Admin Only)

- **URL**: `/departments/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Department was deleted successfully!"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Cannot delete department with associated users or questions
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Department not found
  - `500 Internal Server Error`: Server error

## Question Management

### Create Question (Academic Director Only)

- **URL**: `/questions`
- **Method**: `POST`
- **Authentication**: Required (Academic Director)
- **Headers**: `x-access-token: <your_token>`
- **Request Body**:
  ```json
  {
    "text": "How would you rate the quality of teaching in this course?",
    "year": 2023,
    "departmentId": 1
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "text": "How would you rate the quality of teaching in this course?",
    "year": 2023,
    "departmentId": 1,
    "createdBy": 3,
    "active": true,
    "updatedAt": "2023-06-01T12:00:00.000Z",
    "createdAt": "2023-06-01T12:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Required fields missing
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Department not found
  - `500 Internal Server Error`: Server error

### Get All Questions

- **URL**: `/questions`
- **Method**: `GET`
- **Authentication**: Required
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "text": "How would you rate the quality of teaching in this course?",
      "year": 2023,
      "departmentId": 1,
      "createdBy": 3,
      "active": true,
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "department": {
        "id": 1,
        "name": "Computer Science"
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `500 Internal Server Error`: Server error

### Get Questions by Department and Year

- **URL**: `/questions/department/:departmentId/year/:year`
- **Method**: `GET`
- **Authentication**: Required
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "text": "How would you rate the quality of teaching in this course?",
      "year": 2023,
      "departmentId": 1,
      "createdBy": 3,
      "active": true,
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "department": {
        "id": 1,
        "name": "Computer Science"
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `500 Internal Server Error`: Server error

### Update Question (Academic Director Only)

- **URL**: `/questions/:id`
- **Method**: `PUT`
- **Authentication**: Required (Academic Director)
- **Headers**: `x-access-token: <your_token>`
- **Request Body**:
  ```json
  {
    "text": "Updated question text",
    "year": 2024,
    "departmentId": 2,
    "active": true
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Question updated successfully",
    "question": {
      "id": 1,
      "text": "Updated question text",
      "year": 2024,
      "departmentId": 2,
      "createdBy": 3,
      "active": true,
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Question not found
  - `500 Internal Server Error`: Server error

### Delete Question (Academic Director Only)

- **URL**: `/questions/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Academic Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Question deleted successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `404 Not Found`: Question not found
  - `500 Internal Server Error`: Server error

### Get Questions by Creator (Admin Only)

- **URL**: `/questions/creator/:creatorId`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "text": "How would you rate the quality of teaching in this course?",
      "year": 2023,
      "departmentId": 1,
      "createdBy": 3,
      "active": true,
      "createdAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "department": {
        "id": 1,
        "name": "Computer Science"
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

## Feedback Management

### Submit Feedback (Students and Staff Only)

- **URL**: `/feedback/submit`
- **Method**: `POST`
- **Authentication**: Required (Student or Staff)
- **Headers**: `x-access-token: <your_token>`
- **Request Body**:
  ```json
  {
    "questionId": 1,
    "rating": 4,
    "notes": "The teaching was very good, but could improve in some areas."
  }
  ```
- **Success Response**: `201 Created` (for new feedback) or `200 OK` (for updated feedback)
  ```json
  {
    "message": "Feedback submitted successfully",
    "feedback": {
      "id": 1,
      "rating": 4,
      "notes": "The teaching was very good, but could improve in some areas.",
      "userId": 1,
      "questionId": 1,
      "submittedAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "createdAt": "2023-06-01T12:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Required fields missing or question is inactive
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions or department/year mismatch
  - `404 Not Found`: Question or user not found
  - `500 Internal Server Error`: Server error

### Get Feedback by Current User

- **URL**: `/feedback/my-feedback`
- **Method**: `GET`
- **Authentication**: Required
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "rating": 4,
      "notes": "The teaching was very good, but could improve in some areas.",
      "userId": 1,
      "questionId": 1,
      "submittedAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "question": {
        "id": 1,
        "text": "How would you rate the quality of teaching in this course?",
        "year": 2023,
        "department": {
          "id": 1,
          "name": "Computer Science"
        }
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `500 Internal Server Error`: Server error

### Get Feedback by User ID (Admin Only)

- **URL**: `/feedback/user/:userId`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "rating": 4,
      "notes": "The teaching was very good, but could improve in some areas.",
      "userId": 1,
      "questionId": 1,
      "submittedAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "question": {
        "id": 1,
        "text": "How would you rate the quality of teaching in this course?",
        "year": 2023,
        "department": {
          "id": 1,
          "name": "Computer Science"
        }
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get Feedback by Question (Admin Only)

- **URL**: `/feedback/question/:questionId`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "questionId": 1,
    "totalResponses": 10,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
      "5": 4
    },
    "feedback": [
      {
        "id": 1,
        "rating": 4,
        "notes": "The teaching was very good, but could improve in some areas.",
        "userId": 1,
        "questionId": 1,
        "submittedAt": "2023-06-01T12:00:00.000Z",
        "updatedAt": "2023-06-01T12:00:00.000Z",
        "createdAt": "2023-06-01T12:00:00.000Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "fullName": "John Doe",
          "year": 2023,
          "departmentId": 1,
          "department": {
            "id": 1,
            "name": "Computer Science"
          }
        }
      },
      {...}
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get Feedback Statistics by Department (Admin Only)

- **URL**: `/feedback/stats/department/:departmentId`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "departmentId": 1,
    "totalResponses": 50,
    "averageRating": 4.3,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 5,
      "4": 20,
      "5": 20
    },
    "questionStats": [
      {
        "questionId": 1,
        "questionText": "How would you rate the quality of teaching in this course?",
        "responses": 25,
        "averageRating": 4.2
      },
      {...}
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get All Feedback (Admin Only)

- **URL**: `/feedback/all`
- **Method**: `GET`
- **Authentication**: Required (Academic Director or Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "rating": 4,
      "notes": "The teaching was very good, but could improve in some areas.",
      "userId": 1,
      "questionId": 1,
      "submittedAt": "2023-06-01T12:00:00.000Z",
      "updatedAt": "2023-06-01T12:00:00.000Z",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "user": {
        "id": 1,
        "username": "johndoe",
        "fullName": "John Doe",
        "year": 2023,
        "departmentId": 1,
        "department": {
          "id": 1,
          "name": "Computer Science"
        }
      },
      "question": {
        "id": 1,
        "text": "How would you rate the quality of teaching in this course?",
        "year": 2023,
        "departmentId": 1,
        "department": {
          "id": 1,
          "name": "Computer Science"
        }
      }
    },
    {...}
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error

### Get Overall Feedback Statistics (Executive Director Only)

- **URL**: `/feedback/stats/overall`
- **Method**: `GET`
- **Authentication**: Required (Executive Director)
- **Headers**: `x-access-token: <your_token>`
- **Success Response**: `200 OK`
  ```json
  {
    "totalResponses": 150,
    "overallAverageRating": 4.1,
    "overallRatingDistribution": {
      "1": 5,
      "2": 10,
      "3": 20,
      "4": 50,
      "5": 65
    },
    "departmentStats": [
      {
        "departmentId": 1,
        "departmentName": "Computer Science",
        "responses": 75,
        "averageRating": 4.3,
        "ratingDistribution": {
          "1": 2,
          "2": 3,
          "3": 10,
          "4": 25,
          "5": 35
        }
      },
      {...}
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: No token provided or invalid token
  - `403 Forbidden`: Insufficient permissions
  - `500 Internal Server Error`: Server error