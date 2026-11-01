const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let isFreeHand=false;
let gravity=9.81;
let lastTime=0;
let wireThickness = 3;
let objects=[];
let points=[];
canvas.width=800;
canvas.height=500;

canvas.addEventListener("pointerdown",(event)=>{
    canvas.setPointerCapture(event.pointerId);
    isFreeHand=true;
    points=[];
    points.push({x: event.offsetX,y: event.offsetY});
});

canvas.addEventListener("pointermove",(event)=>{
    if (!isFreeHand) return;

    points.push({
        x: event.offsetX,y: event.offsetY
    });
});

canvas.addEventListener("pointerup",(event)=>{
    isFreeHand=false;
    let length= calculateLength(points);
    let materialDensity=8920;
    let object=({
        points:[...points],
        velocityY:0,
        length:length,
        thickness: wireThickness,
        density:materialDensity
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
        object.velocityY+=gravity * deltaTime;

        for (let point of object.points){
            point.y += object.velocityY * deltaTime;
        }
    }
 


    // let lowestPoint=object.points[0].y;
    // for (let point of objects){
    //     if (point.y > lowestPoint){
    //         lowestPoint=point.y;
    //     }
    // }
    // if (lowestPoint >= canvas.height){
    //     object.velocityY=0;

    //     for (let point of objects.point){
    //         point.y-= lowestPoint-canvas.height;
    //     }
    // }
};

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
        ctx.beginPath();
        ctx.moveTo(object.points[0].x, object.points[0].y);
        for (let i=1;i< object.points.length; i++){
            ctx.lineTo(
                object.points[i].x, object.points[i].y
            )};
        ctx.lineWidth=object.thickness;
        ctx.stroke();
        }
    
    if (isFreeHand){
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for (let i=1;i<points.length;i++){
            ctx.lineTo(points[i].x,points[i].y);
        }
        ctx.lineWidth=3;
        ctx.stroke();
    }

    ctx.stroke();
    
    requestAnimationFrame(animate);
};

animate();