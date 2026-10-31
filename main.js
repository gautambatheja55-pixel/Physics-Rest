const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let isFreeHand=false;
let gravity=0.5;
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
    objects.push({
        points:[...points],
        velocityY:0
    });
});

function draw(){
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1; i < points.length; i++) {
        ctx.lineTo(points[i].x,points[i].y);
    }
    ctx.lineWidth=3;
    ctx.stroke();
}

function updatePhysics(){
    for (let object of objects){
        object.velocityY+=gravity;

        for (let point of object.points){
            point.y += object.velocityY;
        }
    }
};

function animate(){
    updatePhysics();
    ctx.clearRect(0,0,canvas.width,canvas.height)
    for (let object of objects){
        ctx.beginPath();
        ctx.moveTo(object.points[0].x, object.points[0].y);
        for (let i=1;i< object.points.length; i++){
            ctx.lineTo(
                object.points[i].x, object.points[i].y
            )};
        ctx.lineWidth=3;
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