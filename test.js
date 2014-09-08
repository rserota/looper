// Timing stuff goes here
var start = performance.now()
var bpm = 90 // beats per minute
var beat = ( 60 / bpm ) * 1000 // length of one beat
var b = function(numBeats) {
    return numBeats * beat;
}
//////////////////////////

// Animation / UI stuff goes here

$metronome = $('#metronome')
$one       = $('.one')
$two       = $('.two')
$three     = $('.three')
$four      = $('.four')
var animateFrame = function(){
    var now = performance.now()
    var progressInBeat = ( ( ( now - start ) % beat ) / beat )
    var progressInLoop = ( ( ( now - start ) % ( beat * 4 ) ) / ( beat * 4 ) )
    console.log(progressInLoop)

    if      ( ( progressInLoop > .00 ) && ( progressInLoop < .25 ) ) { $one.addClass('on'); $four.removeClass('on') }
    else if ( ( progressInLoop > .25 ) && ( progressInLoop < .50 ) ) { $two.addClass('on'); $one.removeClass('on') }
    else if ( ( progressInLoop > .50 ) && ( progressInLoop < .75 ) ) { $three.addClass('on'); $two.removeClass('on') }
    else if ( ( progressInLoop > .75 ) && ( progressInLoop < 1.0 ) ) { $four.addClass('on'); $three.removeClass('on') }

    $metronome.css('transform', 'rotate(' + (( progressInBeat * 360 ) - 90 ) + 'deg)')

    requestAnimationFrame(animateFrame)
}

////////////////////////////////

// Audio preloading/initialization/whatever goes here.
var kick = new Wad({
    source : 'http://localhost:8000/kick.mp3'
})
var hat = new Wad(Wad.presets.hiHatClosed)
var snare = new Wad({ source : 'noise', volume : 3, env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 }, delay : { delayTime : .05} })

var piano = new Wad({source:'sine', env:{attack:.005, decay:.2, sustain:.8, hold:10, release:.3}, filter : {type:'lowpass', frequency:700}})

var looper = new Wad.Poly({
    // recConfig : { 
    //     workerPath : '/src/Recorderjs/recorderWorker.js'
    // },
    // reverb : {
    //     wet : .8,
    //     impulse : 'http://localhost:8000/widehall.wav'
    // },
    delay : {
        delayTime: b(4),
        maxDelayTime: 10,
        feedback : 1,
        wet      : 1
    },
    // filter : {
    //     type : 'lowpass',
    //     frequency : 1300
    // }
})
var mt = new Wad.Poly({ 
    reverb : { 
        impulse :'http://localhost:8000/widehall.wav',
        wet : .2
    },
    callback : function(that){
        that.add(kick).add(hat).add(snare).add(piano).add(voice)
    }
})
// var lfo = new Wad({source:'sine', volume: 1.5, destination: mt.delay.feedbackNode.gain})
// lfo.play({pitch: 1})


var voice = new Wad({ source : 'mic'})
// mt.add(voice)


var saw = new Wad({source:'sawtooth', volume : 2, env : { attack : .051, hold : 1.33, release : .3 }})
var triangle = new Wad({source:'triangle', volume : .2, env : { attack : .1, hold : .3, release : .3 }})
Wad.midiInstrument = piano


var midiRig = function(event){
    console.log(event.receivedTime, event.data)
    if ( event.data[0] === 144 ) { // 144 means the midi message has note data
        // console.log('note')
        if ( event.data[1] === 36 && event.data[2] > 0 ) { hat.play() }
        else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        else if ( event.data[1] === 40 && event.data[2] > 0 ) { snare.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
        // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }

        else if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
            console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
            Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
        }
        else if ( event.data[2] > 0 ) {
            console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
            Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], callback : function(that){
                console.log(that.soundSource.frequency.value)
            }})
        }
    }
    else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
        console.log('controller')
        if ( event.data[1] == 64 ) {
            if ( event.data[2] == 127 ) { looper.add(mt) ; console.log('on')}
            else if ( event.data[2] == 0 ) { looper.remove(mt); console.log('off')}
        }
    }
    else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
        console.log('pitch bend')
        console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
        Wad.midiInstrument.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
    }
}
//////////////////////////////////////////////////////////////////






$(document).ready(function(){


    animateFrame()


    $('#micOn').on('click', function(){
        voice.play()
    })

    if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRig }

    $(document).on('keydown', function(event){
        console.log(event)
        var looping = false
        if ( event.which === 32 ) {
            looping = !looping
            if ( looping ) { looper.add(mt) }
            else if ( !looping ) {looper.remove(mt) }
        }
    })

    $('.note').on('mousedown', function(){
        piano.play({ pitch : $(this).text() })
    })
    $('.note').on('mouseup', function(){
        piano.stop()
    })

})