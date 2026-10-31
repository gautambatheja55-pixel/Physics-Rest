const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let isFreeHand=false;
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
    draw();
});

canvas.addEventListener("pointerup",(event)=>{
    isFreeHand=false;
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