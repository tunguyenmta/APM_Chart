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
        name: 'service-name',
        type: 'new',
        createdAt: ...,
        serverCreatedAt: ...
    },
    {id: ...,
        name: 'service-name',
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
        name: 'service-name',
        type: 'response',
        requestID: ...,
        serverCreatedAt: ...,
        clientRecievedAt: ...
    },
    {
        responseID: ...,
        name: 'service-name',
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
Create an instance of APMChart class inside script tag in your HTML file with 2 parameters includes: first is ID of the DOM element where the APMChart will be rendered, second is options  {pending_time, fatal_time, width, height} object with a list of options that user can set to APMChart instance. Finally, after creating an instance of APMChart class, calling render method to make the APMChart display on the screen and then calling 3 methods startGeneratingServices, updateServiceResponse and updateProgressBar with data get from calling api to server to monitor the performance. In the below I just describe an example using fetch to get data from server to get data for creating new service requests from client to server if we want to monitor continously we need to call the api to get data like real time. In file index.html i'm using rxjs to create random data for demo. 
```
<body>
    <div id="apm-monitoring"></div>
    <script>
     const chart = new APMChart(
        'apm-monitoring',         // required
        {
            pending_time: ....,   // optional
            fatal_time: ....,     // optional   
            width: ....,          // optional
            height: ....,         // optional 
        }                 
        ).render()
    // serviceData, selectedElements, ramUsage, cpuUsage will be updated by interval calling api to get data from server 
    let serviceData = []
    let selectedElements = []
    setInterval(()=>{
        fetch(...).then(res=>res.json()).then(data=>{
                serviceData.push(...data)
                chart.startGeneratingServices(serviceData)
    }, 0)       
        fetch(...).then(res=>res.json()).then(data=>{
            selectedElements.push(...data)
            chart.updateServiceResponse(selectedElements)
        })
     fetch(...).then(res=>res.json()).then(data=>{
            chart.updateProgressBar(data.ramUsage, data.cpuUsage)
        })
     
    })
    
     
     
    </script>
</body>

``` 
