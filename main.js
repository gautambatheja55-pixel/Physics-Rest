const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const penButton = document.getElementById("freehand");
const shapesButton = document.getElementById("shapes");
const grabButton = document.getElementById("grabButton");
const horizontarBar = document.getElementById("horizontal");
const PIXELS_PER_METER = 100;

let isFreeHand=false;
let isDrawingShape = false;
let gravity=9.81;
let lastTime=0;
let wireThickness = 3; 
let objects=[];
let points=[];
let penColor="#171717";
let selectedShape = null;
let startX = 0;
let startY = 0;
let currentX =0;
let currentY = 0;

canvas.width=1700;
canvas.height=620;

canvas.addEventListener("pointerdown",(event)=>{
    canvas.setPointerCapture(event.pointerId);
    if (selectedShape != null){
        isDrawingShape = true;
        startX=event.offsetX;
        startY=event.offsetY;
        currentX = startX;
        currentY = startY;
        return;
    }

    isFreeHand=true;
    points=[];
    points.push({x: event.offsetX,y: event.offsetY});
    
});

canvas.addEventListener("pointermove",(event)=>{
    if (selectedShape !== null){
        currentX = event.offsetX;
        currentY = event.offsetY;
        return;
    }
    if (!isFreeHand) return;
    points.push({
        x: event.offsetX,y: event.offsetY
    });
});

canvas.addEventListener("pointerup",(event)=>{
    if (selectedShape!=null){
        let endX = event.offsetX;
        let endY = event.offsetY;
        
        if (selectedShape === "rectangle"){
            let width =endX- startX;
            let height= endY - startY;
            let shape = {
                type:"rectangle",
                x: startX,
                y:startY,
                width:width,
                height:height,
                velocityY:0,
                thickness: wireThickness,
                density: 8920,
                length:(2*(Math.abs(width) + Math.abs(height))) / PIXELS_PER_METER,
            };
            shape.mass=calculateMass(shape);
            shape.inertia=calculateMomentOfInertia(shape);
            shape.centreOfMass=calculateCentreOfMass(shape);
            objects.push(shape);
            console.log("Length: ",shape.length,"m");
            console.log("Thickness: ",shape.thickness);
            console.log("Density: ", shape.density);
            console.log("Radius", shape.wireRadius);
            console.log("Area",shape.area);
            console.log("Linear density",shape.linearDensity);
            console.log("Mass",shape.mass,"kg");
            console.log("COM: ",shape.centreOfMass);
            console.log("Inertia: ",shape.inertia);
            isDrawingShape=false;
        }

        if (selectedShape === "circle"){
            let dx = endX - startX;
            let dy = endY - startY;
            let radius = Math.sqrt(dx*dx + dy * dy);
            let shape ={
                type:"circle",
                x:startX,
                y:startY,
                radius:radius,
                velocityY:0,
                thickness: wireThickness,
                density:8920,
                length: (2* Math.PI * radius) / PIXELS_PER_METER
            };
            shape.mass = calculateMass(shape);
            shape.inertia = calculateMomentOfInertia(shape);
            shape.centreOfMass = calculateCentreOfMass(shape);
            objects.push(shape);
            console.log("Length: ",shape.length,"m");
            console.log("Thickness: ",shape.thickness);
            console.log("Density: ", shape.density);
            console.log("Radius", shape.wireRadius);
            console.log("Area",shape.area);
            console.log("Linear density",shape.linearDensity);
            console.log("Mass",shape.mass,"kg");
            console.log("COM: ",shape.centreOfMass);
            isDrawingShape=false;
        }
        return;
    }

    isFreeHand=false;
    let length= calculateLength(points);
    let materialDensity=8920;
    let object=({
        points:[...points],
        velocityY:0,
        length:length,
        thickness: wireThickness,
        density:materialDensity,
        color:penColor,
        
    });
    object.mass=calculateMass(object);
    object.centreOfMass=calculateCentreOfMass(object);
    object.inertia=calculateMomentOfInertia(object);
    objects.push(object);
    console.log("Length: ",object.length,"m");
    console.log("Thickness: ",object.thickness);
    console.log("Density: ", object.density);
    console.log("Radius", object.wireRadius);
    console.log("Area",object.area);
    console.log("Linear density",object.linearDensity);
    console.log("Mass",object.mass,"kg");
    console.log("COM: ",object.centreOfMass);
    console.log("Inertia: ", object.inertia);
});

function draw(){
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1; i < points.length; i++) {
        ctx.lineTo(points[i].x,points[i].y);
    }
    ctx.lineWidth=object.thickness;
    ctx.stroke();
}

function calculateLength(points){
    let totalLength=0;

    for (let i=1; i<points.length; i++){
        let dx = points[i].x - points[i-1].x;
        let dy = points[i].y - points[i-1].y;

        let distance = Math.sqrt(dx*dx + dy*dy);
        totalLength+=distance;
    }
      return totalLength/PIXELS_PER_METER
}

function calculateMass(object){
    let radius=object.thickness/(2*100); 
    let area= Math.PI*radius**2;
    let linearDensity=object.density*area;
    let mass= linearDensity * object.length;
    object.wireRadius=radius;
    object.area=area;
    object.linearDensity=linearDensity;
    return mass;
};

function updatePhysics(deltaTime){
    for (let object of objects){
        if (object.type === "rectangle"){
            object.velocityY += gravity * deltaTime;
            object.y += object.velocityY * deltaTime;
            continue;
        }
        if (object.type === "circle"){
            object.velocityY += gravity * deltaTime;
            object.y += object.velocityY * deltaTime;
            continue;
        }
        object.velocityY+=gravity * deltaTime;

        for (let point of object.points){
            point.y += object.velocityY * deltaTime;
        }
    }
};

penButton.addEventListener("click",showFreehandOptions);
shapesButton.addEventListener("click",showShapesOptions);

function showFreehandOptions(){
    selectedShape = null;
    horizontarBar.innerHTML=`
    <button class="color-option" data-color="#171717"></button>
    <button class="color-option" data-color="red"></button>
    <button class="color-option" data-color="green"></button>
    <button class="color-option" data-color="blue"></button>
    <button class="color-option" data-color="yellow"></button>
    <label for="thickness" id="nameof">Thickness: </label>
    <input type="range" id="thickness" min="1" max="12" value="3">
    <span id="thickness-value"> 3px</span>`;

    let colorButtons = horizontarBar.querySelectorAll(".color-option");
    colorButtons.forEach(button => {
        button.addEventListener("click",()=>{
            penColor=button.dataset.color;
        });
    });
    const thicknessSlider = document.getElementById("thickness");
    const thicknessValue= document.getElementById("thickness-value");
    thicknessSlider.addEventListener("input",()=>{
        wireThickness=Number(thicknessSlider.value);
        thicknessValue.textContent=wireThickness + " px";
    });
}   

function showShapesOptions(){
    isFreeHand = false;
    horizontarBar.innerHTML=`
    <button class="shape-option" data-shape="rectangle"> ▭ </button>
    <button class="shape-option" data-shape="circle">°</button>
    <button class="shape-option" data-shape="triangle"> △ </button>`
    let shapeButtons = horizontarBar.querySelectorAll(".shape-option");
    shapeButtons.forEach(button => {
        button.addEventListener("click",() => {
            selectedShape = button.dataset.shape;
        });
    });
}

function BoundingBox(object){

    if (object.type === "rectangle"){
        return{
            minX: Math.min(object.x,object.x + object.width),
            maxX: Math.max(object.x,object.x + object.width),
            minY: Math.min(object.y, object.y + object.height),
            maxY: Math.max(object.y, object.y + object.height)
        };
    }

    if (object.type === "circle"){
        return{
            minX:object.x - object.radius,
            maxX:object.x + object.radius,
            minY: object.y - object.radius,
            maxY: object.y + object.radius
        };
    }

    let minX = object.points[0].x;
    let maxX = object.points[0].x;
    let minY = object.points[0].y;
    let maxY = object.points[0].y;

    for ( let point of object.points){
        if (point.x < minX){
            minX = point.x;
        }
        if (point.x > maxX){
            maxX=point.x;
        }
        if (point.y < minY){
            minY = point.y;
        }
        if (point.y > maxY){
            maxY = point.y
        }
    }
    return {
        minX:minX,
        maxX:maxX,
        minY:minY,
        maxY:maxY
    };
}

function boundingBoxOverlap(boxA,boxB){
    return (boxA.minX < boxB.maxX 
        && boxA.maxX > boxB.minX 
        && boxA.minY < boxB.maxY && 
        boxA.maxY >boxB.minY);
}

function checkCollisions(){
    for (let i=0; i< objects.length; i++){
        for (let j=i+1; j< objects.length; j++){
            let objectA = objects[i];
            let objectB = objects[j];
            let boxA = BoundingBox(objectA);
            let boxB = BoundingBox(objectB);
            if (boundingBoxOverlap(boxA, boxB)){
                if (doObjectsIntersect(objectA,objectB)){
                      console.log("it is an collision u should be able to see why you r checking console for it");
                }
            }
        }
    }
}


function orientationof(A, B, C) {
    return (B.y - A.y) * (C.x - B.x) - (B.x - A.x) * (C.y - B.y)
}

function dosegmentsIntersect(A,B,C,D){
    let o1 = orientationof(A,B,C);
    let o2 = orientationof(A,B,D);
    let o3 = orientationof(C,D,A);
    let o4 = orientationof(C,D,B);

    if (o1 * o2 < 0 && o3 * o4 < 0 ){
        return true;
    }

    if (Math.abs(o1) < 1e-9 && isPointOnSegment(A,B,C)){
        return true;
    }
    if (Math.abs(o2) < 1e-9 && isPointOnSegment(A,B,D)){
        return true;
    }
    if (Math.abs(o3) < 1e-9  && isPointOnSegment(C,D,A)){
        return true;
    }
    if (Math.abs(o4) < 1e-9  && isPointOnSegment(C,D,B)){
        return true;
    }
    return false;
}

function isPointOnSegment(A,B,P){
    if (  
    Math.abs(orientationof(A,B,P)) < 1e-9 && 
    P.x >= Math.min(A.x,B.x) &&
    P.x <= Math.max(A.x, B.x) &&
    P.y >= Math.min(A.y,B.y) && 
    P.y <= Math.max(A.y,B.y)){
        return true;
    }
    return false;
}


function doObjectsIntersect(objectA , objectB){
    if (objectA.points && objectB.points){
        for (let i = 0 ; i < objectA.points.length - 1; i++){
            let A = objectA.points[i];
            let B = objectA.points[i+1];
            for (let j=0; j< objectB.points.length -1; j++){
                let C = objectB.points[j];
                let D = objectB.points[j+1];

                if (dosegmentsIntersect(A,B,C,D)){
                    return true;
                }
            }
        }
    }

    if (objectA.type === "rectangle" && objectB.type === "rectangle"){
        return rectangleRectangleIntersect(objectA, objectB);
    }
    if (objectA.points && objectB.type==="rectangle"){
        return wireRectangleIntersect(objectA,objectB);
    }
    if (objectA.type === "rectangle" && objectB.points){
        return wireRectangleIntersect(objectB,objectA);
    }

    return false;
  
}

function getRectangleEdges(object){
    let A = {x: object.x , y: object.y};
    let B = {x: object.x + object.width, y: object.y};
    let C = {x: object.x + object.width, y: object.y + object.height};
    let D = {x: object.x, y: object.y + object.height};

    return [
        [A,B],[B,C],[C,D],[D,A]
    ];
}

function rectangleRectangleIntersect(objectA,objectB){
    let edgesA= getRectangleEdges(objectA);
    let edgesB = getRectangleEdges(objectB);
    for (let edgeA of edgesA){
        for (let edgeB of edgesB){
            if (dosegmentsIntersect(
                edgeA[0],edgeA[1],edgeB[0],edgeB[1]
            )){
                return true;
            }
        }
    }
    return false;
}

function wireRectangleIntersect(wire, rectangle){
    let edges= getRectangleEdges(rectangle);
    for (let i=0; i<wire.points.length - 1; i++){
        let A = wire.points[i];
        let B = wire.points[i+1];

        for (let edge of edges){
            if (dosegmentsIntersect(A,B,edge[0], edge[1])){
                return true;
            }
        }
    }
    return false;
}

function calculateCentreOfMass(object){

    if (object.type === "circle"){
        return {
            x: object.x,
            y: object.y
        };
    }

    if (object.type === "rectangle"){
        return {
            x: object.x + object.width/2,
            y:object.y + object.height /2
        };
    }
    
    if (object.points){
        let totalLength =0 ;
        let weightX = 0;
        let weightY =0;

        for (let i=0 ; i<object.points.length -1 ; i++){
            let A = object.points[i];
            let B = object.points[i+1];

            let dx= B.x  - A.x;
            let dy= B.y - A.y;
            let segmentLength = Math.sqrt(dx*dx + dy*dy);
            let midpointX= (A.x + B.x )/2
            let midpointY= (A.y + B.y )/2
            totalLength+=segmentLength;
            weightX += midpointX * segmentLength;
            weightY += midpointY * segmentLength;
        }

        if (totalLength === 0) return null;
        return {
            x:weightX/totalLength,
            y:weightY/totalLength,
        };
    }
    return null;
}

function calculateMomentOfInertia(object){
    let mass = object.mass;
    if (object.type === "circle"){
        let radius = object.radius / PIXELS_PER_METER;
        return mass * radius ** 2;
    }
    if (object.type === "rectangle"){
        let width = Math.abs(object.width) / PIXELS_PER_METER;
        let height = Math.abs(object.height) / PIXELS_PER_METER;
        return mass * (width + height) ** 2 /12;
    }
    let totalInertia=0;
    for (let i=0; i< object.points.length -1; i++){
        let A = object.points[i];
        let B = object.points[i+1];
        let dx = (B.x - A.x) / PIXELS_PER_METER;
        let dy = (B.y - A.y) / PIXELS_PER_METER;
        let segmentLength = Math.sqrt(dx**2 + dy** 2);
        let segmentMass = object.density * object.area * segmentLength;
        let midpointX = (A.x + B.x)/2;
        let midpointY = (A.y + B.y)/2;
        let dxCOM= (midpointX - object.centreOfMass.x) / PIXELS_PER_METER;
        let dyCOM = (midpointY - object.centreOfMass.y) / PIXELS_PER_METER;
        let distanceSquared = dxCOM ** 2 + dyCOM ** 2;
        let segmentInertia = (segmentMass * segmentLength ** 2) /12 + segmentMass * distanceSquared;
        totalInertia += segmentInertia;
    }
    return totalInertia;
}

function animate(currentTime){
    if (lastTime===0){
        lastTime=currentTime;
        requestAnimationFrame(animate);
        return;
    }
    let deltaTime=(currentTime-lastTime)/1000;
    lastTime=currentTime;
    updatePhysics(deltaTime);
    checkCollisions();

    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.beginPath();
    ctx.moveTo(0,canvas.height - 10);
    ctx.lineTo(canvas.width,canvas.height - 10);
    ctx.strokeStyle="black";
    ctx.lineWidth=5;
    ctx.stroke();

    for (let object of objects){
        if (object.type === "rectangle"){
            ctx.strokeRect(
                object.x,
                object.y,
                object.width,
                object.height
            );
            continue;
        }
        if (object.type === "circle"){
            ctx.beginPath();
            ctx.arc(object.x,object.y,object.radius,0,Math.PI * 2);
            ctx.stroke();
            continue;
        }
      
        ctx.beginPath();
        ctx.moveTo(object.points[0].x, object.points[0].y);
        for (let i=1;i< object.points.length; i++){
            ctx.lineTo(
                object.points[i].x, object.points[i].y
            )};
        ctx.lineWidth=object.thickness;
        ctx.strokeStyle=object.color;
        ctx.stroke();
        }
    
    if (isDrawingShape && selectedShape === "rectangle"){
        let width= currentX - startX;
        let height = currentY - startY;
        ctx.strokeRect(startX,startY,width,height);
    }
    if (isDrawingShape && selectedShape === "circle"){
        let dx = currentX - startX;
        let dy = currentY - startY;
        let radius = Math.sqrt(dx*dx + dy * dy);
        ctx.beginPath();
        ctx.arc(startX,startY,radius,0,Math.PI*2);
        ctx.stroke();
    }
    if (isFreeHand){
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for (let i=1;i<points.length;i++){
            ctx.lineTo(points[i].x,points[i].y);
        }

       ctx.lineWidth=wireThickness;
       ctx.strokeStyle=penColor;
       ctx.stroke();
    }
 
    requestAnimationFrame(animate);
};

animate();