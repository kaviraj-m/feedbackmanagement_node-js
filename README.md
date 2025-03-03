# Feedback Management System API Test Documentation

This document provides comprehensive testing documentation for the Feedback Management System API using Postman. It includes all endpoints, required parameters, authentication details, and expected responses.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Department Management](#department-management)
5. [Question Management](#question-management)
6. [Feedback Management](#feedback-management)

## Environment Setup

Create a Postman environment with the following variables:

| Variable | Initial Value | Description |
|----------|---------------|--------------|
| `base_url` | `http://localhost:8080/api` | Base URL for the API |
| `token` | Empty | JWT token received after login |

## Authentication

### Register User

- **Method**: POST
- **URL**: `{{base_url}}/auth/signup`
- **Headers**:
  - Content-Type: application/json
- **Body**:
```json
{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "fullName": "Test User",
    "year": 2,
    "departmentId": 1,
    "roles": ["student"]
}
```
- **Expected Response**: 201 Created
```json
{
    "message": "User registered successfully with specified roles"
}
```
- **Tests**:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response contains success message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("User registered successfully");
});
```

### Login User

- **Method**: POST
- **URL**: `{{base_url}}/auth/signin`
- **Headers**:
  - Content-Type: application/json
- **Body**:
```json
{
    "username": "testuser",
    "password": "password123"
}
```
- **Expected Response**: 200 OK
```json
{
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "year": 2,
    "sinNumber": null,
    "roles": ["ROLE_STUDENT"],
    "department": {
        "id": 1,
        "name": "Computer Science"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains access token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.accessToken).to.exist;
    
    // Set the token as an environment variable for subsequent requests
    pm.environment.set("token", jsonData.accessToken);
});

pm.test("Response contains user information", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.username).to.exist;
    pm.expect(jsonData.email).to.exist;
    pm.expect(jsonData.roles).to.be.an('array');
});
```

## User Management

### Get Current User Profile

- **Method**: GET
- **URL**: `{{base_url}}/users/profile`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
```json
{
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "year": 2,
    "sinNumber": null,
    "department": {
        "id": 1,
        "name": "Computer Science"
    },
    "roles": [
        {
            "id": 1,
            "name": "student"
        }
    ]
}
```
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains user profile data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.username).to.exist;
    pm.expect(jsonData.email).to.exist;
    pm.expect(jsonData.roles).to.be.an('array');
});
```

### Get All Users (Admin Only)

- **Method**: GET
- **URL**: `{{base_url}}/users/all`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK (Array of users) or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("Response is an array of users", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData).to.be.an('array');
        if (jsonData.length > 0) {
            pm.expect(jsonData[0].username).to.exist;
        }
    });
} else {
    pm.test("Access denied for non-admin user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

### Get User by ID

- **Method**: GET
- **URL**: `{{base_url}}/users/1`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains user data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.exist;
    pm.expect(jsonData.username).to.exist;
});
```

### Update User

- **Method**: PUT
- **URL**: `{{base_url}}/users/1`
- **Headers**:
  - Content-Type: application/json
  - x-access-token: {{token}}
- **Body**:
```json
{
    "fullName": "Updated Name",
    "email": "updated@example.com",
    "year": 3
}
```
- **Expected Response**: 200 OK
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User updated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("User updated successfully");
    pm.expect(jsonData.user).to.exist;
});
```

### Delete User (Admin Only)

- **Method**: DELETE
- **URL**: `{{base_url}}/users/2`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("User deleted successfully", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("User deleted successfully");
    });
} else {
    pm.test("Access denied for non-admin user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

## Department Management

### Get All Departments

- **Method**: GET
- **URL**: `{{base_url}}/departments`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array of departments", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0].name).to.exist;
        
        // Store department ID for later tests
        pm.environment.set("department_id", jsonData[0].id);
    }
});
```

## Question Management

### Create Question (Academic Director Only)

- **Method**: POST
- **URL**: `{{base_url}}/questions`
- **Headers**:
  - Content-Type: application/json
  - x-access-token: {{token}}
- **Body**:
```json
{
    "text": "How would you rate the course content?",
    "year": 2,
    "departmentId": 1
}
```
- **Expected Response**: 201 Created or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 201 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([201, 403]);
});

if (pm.response.code === 201) {
    pm.test("Question created successfully", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.id).to.exist;
        pm.expect(jsonData.text).to.exist;
        
        // Store question ID for later tests
        pm.environment.set("question_id", jsonData.id);
    });
} else {
    pm.test("Access denied for non-academic director", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

### Get All Questions

- **Method**: GET
- **URL**: `{{base_url}}/questions`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array of questions", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0].text).to.exist;
    }
});
```

### Get Questions by Department and Year

- **Method**: GET
- **URL**: `{{base_url}}/questions/department/1/year/2`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array of questions for specific department and year", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0].departmentId).to.equal(1);
        pm.expect(jsonData[0].year).to.equal(2);
    }
});
```

### Update Question (Academic Director Only)

- **Method**: PUT
- **URL**: `{{base_url}}/questions/{{question_id}}`
- **Headers**:
  - Content-Type: application/json
  - x-access-token: {{token}}
- **Body**:
```json
{
    "text": "Updated question text",
    "active": true
}
```
- **Expected Response**: 200 OK or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("Question updated successfully", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Question updated successfully");
        pm.expect(jsonData.question).to.exist;
    });
} else {
    pm.test("Access denied for non-academic director", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

## Feedback Management

### Submit Feedback

- **Method**: POST
- **URL**: `{{base_url}}/feedback/submit`
- **Headers**:
  - Content-Type: application/json
  - x-access-token: {{token}}
- **Body**:
```json
{
    "questionId": "{{question_id}}",
    "rating": 4,
    "notes": "The course content was very informative."
}
```
- **Expected Response**: 201 Created
- **Tests**:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Feedback submitted successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Feedback submitted successfully");
    pm.expect(jsonData.feedback).to.exist;
    
    // Store feedback ID for later tests
    pm.environment.set("feedback_id", jsonData.feedback.id);
});
```

### Get My Feedback

- **Method**: GET
- **URL**: `{{base_url}}/feedback/my-feedback`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK
```json
[
    {
        "id": 1,
        "rating": 4,
        "notes": "The course content was very informative.",
        "createdAt": "2023-05-01T12:00:00.000Z",
        "updatedAt": "2023-05-01T12:00:00.000Z",
        "userId": 1,
        "questionId": 1,
        "question": {
            "id": 1,
            "text": "How would you rate the course content?",
            "year": 2,
            "departmentId": 1
        }
    }
]
```
- **Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains user's feedback", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.expect(jsonData[0].rating).to.exist;
        pm.expect(jsonData[0].question).to.exist;
    }
});
```



if (pm.response.code === 200) {
    pm.test("Response contains feedback data", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.feedback).to.be.an('array');
        pm.expect(jsonData.averageRating).to.exist;
        pm.expect(jsonData.totalResponses).to.exist;
    });
} else {
    pm.test("Access denied for unauthorized user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

### Get Feedback Statistics by Department (Academic Director/Executive Director Only)

- **Method**: GET
- **URL**: `{{base_url}}/feedback/stats/department/{{department_id}}`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("Response contains department feedback statistics", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.departmentName).to.exist;
        pm.expect(jsonData.averageRating).to.exist;
        pm.expect(jsonData.questionStats).to.be.an('array');
        if (jsonData.questionStats.length > 0) {
            pm.expect(jsonData.questionStats[0].questionText).to.exist;
            pm.expect(jsonData.questionStats[0].averageRating).to.exist;
        }
    });
} else {
    pm.test("Access denied for unauthorized user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

### Get All Feedback in Descending Order (Academic Director/Executive Director Only)

- **Method**: GET
- **URL**: `{{base_url}}/feedback/all`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("Response contains feedback in descending order", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData).to.be.an('array');
        
        if (jsonData.length > 1) {
            // Check if feedback is sorted by submittedAt in descending order
            var firstDate = new Date(jsonData[0].submittedAt);
            var secondDate = new Date(jsonData[1].submittedAt);
            pm.expect(firstDate.getTime()).to.be.at.least(secondDate.getTime());
        }
        
        if (jsonData.length > 0) {
            pm.expect(jsonData[0].rating).to.exist;
            pm.expect(jsonData[0].user).to.exist;
            pm.expect(jsonData[0].question).to.exist;
        }
    });
} else {
    pm.test("Access denied for unauthorized user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```

### Get Overall Feedback Statistics (Executive Director Only)

- **Method**: GET
- **URL**: `{{base_url}}/feedback/stats/overall`
- **Headers**:
  - x-access-token: {{token}}
- **Expected Response**: 200 OK or 403 Forbidden
- **Tests**:
```javascript
pm.test("Status code is either 200 or 403", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
    pm.test("Response contains overall feedback statistics", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.overallAverageRating).to.exist;
        pm.expect(jsonData.departmentStats).to.be.an('array');
        if (jsonData.departmentStats.length > 0) {
            pm.expect(jsonData.departmentStats[0].departmentName).to.exist;
            pm.expect(jsonData.departmentStats[0].averageRating).to.exist;
        }
    });
} else {
    pm.test("Access denied for unauthorized user", function () {
        var jsonData = pm.response.json();
        pm.expect(jsonData.message).to.include("Unauthorized");
    });
}
```