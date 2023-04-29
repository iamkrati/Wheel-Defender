var sid='AC4ee3d96219284f0c7242f35bc1e0bec1'
var authtoken='a8cb0db1400cabf65fcafcc9998c99ed'
var twilio=require('twilio')(sid,authtoken);
twilio.messages.create({
    from : "+15076326379",
    to: "+917300696475",
    body : 'This a first SMS by Prachi'
})
.then(()=>{
    console.log("message sent");
})
