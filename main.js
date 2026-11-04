const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const penButton = document.getElementById("freehand");
const shapesButton = document.getElementById("shapes");
const horizontarBar = document.getElementById("horizontal");

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
                velocityY:0
            };
            objects.push(shape);
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
        color:penColor
    });
    object.mass=calculateMass(object);
    objects.push(object);
    console.log("Length: ",object.length,"m");
    console.log("Thickness: ",object.thickness);
    console.log("Density: ", object.density);
    console.log("Radius", object.radius);
    console.log("Area",object.area);
    console.log("Linear density",object.linearDensity);
    console.log("Mass",object.mass,"kg");
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
      return totalLength/100; //for now 100px =1m
}

function calculateMass(object){
    let radius=object.thickness/(2*100); 
    let area= Math.PI*radius**2;
    let linearDensity=object.density*area;
    let mass= linearDensity * object.length;
    object.radius=radius;
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
        object.velocityY+=gravity * deltaTime;

        for (let point of object.points){
            point.y += object.velocityY * deltaTime;
        }
    }
};

penButton.addEventListener("click",showFreehandOptions);
shapesButton.addEventListener("click",showShapesOptions);

function showFreehandOptions(){
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

function animate(currentTime){
    if (lastTime===0){
        lastTime=currentTime;
        requestAnimationFrame(animate);
        return;
    }
    let deltaTime=(currentTime-lastTime)/1000;
    lastTime=currentTime;
    updatePhysics(deltaTime);

    ctx.clearRect(0,0,canvas.width,canvas.height)
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