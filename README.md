# FCC-Anonymous-Messageboard-InfoSec-Projects
Boilerplate for FCC Anonymous Messageboard part of FreeCodecamp InfoSec projects


**Functional Tests:**

1. Creating a new thread: POST request to /api/threads/{board}
2. Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
3. Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
4. Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
5. Reporting a thread: PUT request to /api/threads/{board}
6. Creating a new reply: POST request to /api/replies/{board}
7. Viewing a single thread with all replies: GET request to /api/replies/{board}
8. Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
9. Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
10. Reporting a reply: PUT request to /api/replies/{board}

