const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);


const args = process.argv.slice(2)
let ratio, timeUpdate
const wss = new WebSocketServer({ server });
let listServices = []
let listUpdating = []
let errorServices = []
let pendingServices = []
let removeServices = []
let pending_time 
let error_time
let interval
let serviceData = []
let listResponse = []
listPrevResponse = []
let ramUsage = Math.floor(Math.random() * 70)+30;
let cpuUsage = Math.floor(Math.random() * 70)+30;
let selectedIndices = new Set();
timeUpdate = 2500

if(args[0] == 'normal'){
    ratio = .6
} else if(args[0] == 'slow'){
    ratio = .25
} else if(args[0] == 'error'){
    ratio = .1
}
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // console.log('Received message from client:', message);
        if(Array.isArray(JSON.parse(message.toString()).data) && Array.isArray(JSON.parse(message.toString()).updatingServices)){
            listServices = [...JSON.parse(message.toString()).data]
            listUpdating = [...JSON.parse(message.toString()).updatingServices]
    
        } else{
            pending_time = JSON.parse(message.toString()).pending_time
            error_time = JSON.parse(message.toString()).fatal_time
        }
    });


    interval = setInterval(
        () => {
    serviceData = []
        
    const numServicesToGenerate = Math.floor(Math.random() * 6) + 1; // Generate between 1 and 10 services
    for (let i = 0; i < numServicesToGenerate; i++) {
        const service = {
            id: Math.floor(Math.random() * 1000000),
            name: `서비스 ${Math.floor(Math.random() * 20)+1}`, // Randomly assign service name between 'Service 1' to 'Service 20'
            state: 'new',
            createdAt: new Date().getTime(),
            serverCreatedAt: new Date().getTime()+ Math.floor(Math.random() * 2000) + 2000,
};
        serviceData.push(service)
    }
    listResponse = []
    if(listServices.length > 0) {
        pendingServices = listServices.filter((service)=>{
            return new Date().getTime() - service.serverCreatedAt > pending_time && new Date().getTime() - service.serverCreatedAt < error_time
        })
        
        
        errorServices = listServices.filter((service)=>{
            return new Date().getTime() - service.serverCreatedAt > error_time  
        })
    }
    


    // removeServices = listServices.filter((service)=>{

    //     return new Date().getTime() - service.serverCreatedAt > error_time+2000
    // })
    // const shuffledServices = [...listServices].filter(service=>{
    //     return !errorServices.find(item=>item.id == service.id) && !removeServices.find(item=>item.id == service.id) && !listUpdating.find(item=>item.requestID == service.id) && !listPrevResponse.find(item=>item.requestID == service.id)
    // })
    let shuffledServices = listServices.filter(service=>{
        return  !listUpdating.find(item=>item.requestID == service.id) && !listPrevResponse.find(item=>item.requestID == service.id)
    })
    if(args[0] == 'slow'){
        shuffledServices = shuffledServices.filter(service=>{
            return new Date().getTime() - service.serverCreatedAt < pending_time || new Date().getTime() - service.serverCreatedAt > error_time
        })
    } else if(args[0] == 'error'){
        shuffledServices = shuffledServices.filter(service=>{
            return new Date().getTime() - service.serverCreatedAt < error_time + 2000
        })
    }
    // Determine the number of elements to select for the listResponse
    // const numElements = Math.floor(Math.random() * shuffledServices.length);
    let numElements = shuffledServices.length*ratio
    // const numElements = Math.floor(Math.random() * 1);
   for(let i = 0; i< numElements; i++){
    let randomIndex = Math.floor(Math.random() * shuffledServices.length);
    while(selectedIndices.has(shuffledServices[randomIndex].id)){
        randomIndex = Math.floor(Math.random() * shuffledServices.length);
    }
    selectedIndices.add(shuffledServices[randomIndex].id)
    let obj = {
        requestID: shuffledServices[randomIndex].id,
        serverCreatedAt: shuffledServices[randomIndex].serverCreatedAt,
        clientRecievedAt: shuffledServices[randomIndex].serverCreatedAt + Math.floor(Math.random() * 2000) + 2000,
        responseID: Math.floor(Math.random() * 1000000),  
        name: shuffledServices[randomIndex].name,
        state: 'response'  
    }
    listResponse.push(obj)
   }


let data2 = {
    dataPending: pendingServices,
    dataError: errorServices,
    dataRemove: []
}
ramUsage = Math.floor(Math.random() * 70)+30;
cpuUsage = Math.floor(Math.random() * 70)+30;
    selectedIndices.clear();
    listPrevResponse = [...listResponse]
    let data = {
        dataNew: serviceData,
        ramUsage: ramUsage,
        cpuUsage: cpuUsage,
        dataResponse: listResponse,
        data2: data2,
        listServices: listServices,
    }
    ws.send(JSON.stringify(data));
    }, timeUpdate);


    ws.on('close', () => {
        clearInterval(interval);    
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});



// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });