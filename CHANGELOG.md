### 1.1.2

- increase NATS reconnect attempts from 10 to 100, so it should try to reconnect for 200s

### 1.1.0

- add NATS publishing capability
- push instance data with DELETE messages

### 1.0.23

- fixed remove api endpoint bug
- add tests
- change options.restApiRoot to options.apiRoot

### 1.0.22

- fixed inverted logic bug

### 1.0.21

- added the option to remove the API root from channels

### 1.0.20

- made passing next to `publish()` optional
- made method always be set to uppercase

### 1.0.19

- Discarded clustering functionality switch
- code tidy up (whitespace, style adjustments etc)
- fix bug with passed options merging with default options
- linted code with eslinter
- added debugging support

### 1.0.18

- Implemented Clustering Functionality

### 1.0.17

- Implemented Heartbeat to avoid disconnections

### 1.0.16

- Implemented Mixin Level Filters
- Implemented Backward and Forward Messaging
- Fixed messages to relation entities

### 1.0.15

- Fixed pubsub regex

### 1.0.14

- Removed Event Emmiter for Login/Logout
- Removed Event Emmiter for resetPassword
- Removed Event Emmiter for GET Methods
- Removed Event Emmiter for HEAD Methods

### 1.0.13

- Replaced by 1.0.14

### 1.0.12

- Updated NativeScript Documentation
- Fixed event emmiter for query params url

### 1.0.11

- Updated NativeScript Documentation

### 1.0.10

- Improved Documentation
- Added Auth Examples
- Added NativeScript Examples
- Auth Tweaks

### 1.0.9

- Replaced by 1.0.10

### 1.0.8

- Replaced by 1.0.9

### 1.0.7

- Fixed example documentation issues

### 1.0.6

- Implement Event to pass server instance instead mutating app object
- Updated README.md to add modifications in server.js

### 1.0.5

- Implemented ioAuth security
- Implemented configuration for auth
- Updated documentation

### 1.0.4

- First published release
