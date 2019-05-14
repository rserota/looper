var analyser = mainVm.nodes.preDest.nodes[0]
analyser.fftSize = 256;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var animate = function(){
    // analyser.getByteTimeDomainData(dataArray); 
    analyser.getByteFrequencyData(dataArray); 
    var sum = dataArray.reduce(function(prev, cur) { return prev + cur; }) 
    // console.log(dataArray)
    console.log('sum? ', sum )
    requestAnimationFrame(animate)
}
animate()