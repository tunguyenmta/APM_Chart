# APMChart Class Documentation
This documentation provides guidance on using the APMChart class in your application. The APMChart class using D3.js and rxjs to create dynamic reactive for monitoring services of application from client to server and backward.
 
## 1. Introduction
The APMChart class is a JavaScript class that leverages D3.js and rxjs to create dynamic and visually appealing recursively partition space into rectangles according to each node’s associated value. In a period of time the chart will update the services interactive from client to server and backward from server response back to client to help developers finding the services need to upgrade or need to fix when they encouing to many fatal errors at runtime. The color of services on the server side will be shown represent for status of services includes: normal - blue, pending - orange and fatal - red these will be shown for developers to recognize which services are facing with errors.

## 2. Installation
To use the APMChart class, include the D3.js, rxjs library and sh_soft_apm_chart.js file in your HTML file. 


#### `<script src="https://d3js.org/d3.v7.min.js"></script>`
#### `<script src="./rxjs.js"></script>`
#### `<script src="./sh_soft_apm_chart.js"></script>`


## 3. Data Format
to update the data from client send to server we gonna need an data contains object with type:
```
[
    {
        id: ...,
        name: ....,                     // name of the service
        type: 'new',
        createdAt: ...,
        serverCreatedAt: ...
    },
    {id: ...,
        name: ....,                     // name of the service
        type: 'new',
        createdAt: ...,
        serverCreatedAt: ...
    },
    ...
]
```
to update the data response from server send back to client we gonna need an data contains object with type:
```
[
    {
        responseID: ...,
        name: ....,                     // name of the service
        type: 'response',
        requestID: ...,
        serverCreatedAt: ...,
        clientRecievedAt: ...
    },
    {
        responseID: ...,
        name: ....,                    // name of the service
        type: 'response',
        requestID: ...,
        serverCreatedAt: ...,
        clientRecievedAt: ...
    },
    ...
]
```
To update the usage of ram and cpu we need to provide data object with type:
```
    {
        ramUsage : ...,                
        cpuUsage: ...
    }
```
To first created the APMChart instance we need to provide the HTML element's ID where the chart will be rendered and the array contains the list of services name at the start

## 4. Usage
Create an instance of APMChart class inside script tag in your HTML file with 2 parameters includes: first is ID of the DOM element where the APMChart will be rendered, second is options  {pending_time, fatal_time, width, height} object with a list of options that user can set to APMChart instance. Finally, after creating an instance of APMChart class, calling render method to make the APMChart display on the screen and then calling 3 methods startGeneratingServices, updateServiceResponse and updateProgressBar with data get from message which sent by the server to monitor the performance. . In the below demo version I'm using WebSocket to connect to server with address 'http://localhost:3000'. Because we get a server to retrive data for APMChart class to display the animation. So before run file index.html we need to start the server to create data for chart and if you tab is inactive or hidden more than 2 seconds then all the old data and g block inside of svg tag will be removed. If you restart server I also set an reconnect to server after 3 seconds if the web browser os not hidden. To check the status of the services in the demo every 1.5 second I will make an request sending the data that is on the Web container to server and all the status of services will be 3 arrays and depend on the array to change color of service and remove if services inside of dataRemove.
In this version I added node server to create data for APMChart instance through Web Socket. To start server, we need install nodejs and then using 'npm install' at the workspace of the file index.js belong to for installing all the packages that server need to run. After install all the dependencies. Using command 'node ./index.js' to run server (note: terminal present working directory is the directory that contain index.js).
The demo will collect all the services that inside of WEB container and chosing randomly which services will be response to client and update the color of services in WEB server that over of the pending_time and remove if they exceed the error_time. In file HTML, I've set reconnect automatically in every 3 seconds when the socket is shutdown.
```
<body>
    <div id="apm-monitoring"></div>
  <script>
        let socket = null; 
        const chart = new APMChart('chart-container2', {pending_time: 8000, fatal_time: 12000}).render();
        let intervalID;
    
        function handleVisibilityChange() {
            if (document.hidden) {
                if (socket) {
                    socket.send(JSON.stringify({
                        data: []
                    }));
                    chart.stopAnimation();
                    socket.close();
                    socket = null;
                    clearInterval(intervalID);
                }
            } else {
                if (!socket) {
                    chart.startAnimation();
                    initializeWebSocket();
                    intervalID = setInterval(() => {
              if (socket && socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                      data: chart.slotGroup.flatMap(slot => slot.list)
                  }));
              }
          }, 1000);
                }
            }
        }
    
        function initializeWebSocket() {
          if(!socket && !document.hidden){
            socket = new WebSocket('ws://localhost:3000');
            setupSocketListeners();
          }
            
        }
    
        function setupSocketListeners() {
            socket.addEventListener('open', () => {
                socket.send(JSON.stringify({
                    pending_time: chart.pending_time,
                    fatal_time: chart.fatal_time
                }));
                console.log('WebSocket connection established');
            });
    
            socket.addEventListener('message', (event) => {
                const { dataNew, dataResponse, ramUsage, cpuUsage } = JSON.parse(event.data);
                if (dataNew) {
                    chart.startGeneratingServices(dataNew);
                    chart.updateServiceResponse(dataResponse);
                    chart.updateProgressBar(ramUsage, cpuUsage);
                }
                if (JSON.parse(event.data).dataPending?.length > 0) {
                    chart.updateStateInterval(JSON.parse(event.data).dataPending, JSON.parse(event.data).dataError, JSON.parse(event.data).dataRemove);
                }
            });
    
            socket.addEventListener('close', () => {
                console.log('WebSocket connection closed');
                socket = null; 
                setTimeout(initializeWebSocket, 3000);
            });
    
            socket.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
            });
        }
    
        function startInterval() {
            document.addEventListener('visibilitychange', handleVisibilityChange);
    
            if (!socket) {
                chart.startAnimation();
                initializeWebSocket();
            }
    
            intervalID = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({
                        data: chart.slotGroup.flatMap(slot => slot.list)
                    }));
                }
            }, 1500);
        }
    
        startInterval();
    </script>
</body>

``` 
