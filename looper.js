// Timing stuff goes here
var start = performance.now()
var bpm = 90 // beats per minute
var beat = ( 60 / bpm ) * 1000 // length of one beat
var b = function(numBeats) {
    return ( numBeats * beat ) / 1000;
}


// Audio preloading/initialization/whatever goes here.
var kick = new Wad({
    source : 'http://localhost:8000/kick.mp3',
})
// kick.play()
var hat = new Wad(Wad.presets.hiHatClosed)
// var hatOpen = new Wad({})
var snare = new Wad({ source : 'noise', volume : 3, env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 }, delay : { delayTime : .05} })



// var crash = new Wad({})
// var highTom = new Wad({})
// var midTom = new Wad({})
// var lowTom = new Wad({})
var cowbell = new Wad({
    source : 'http://localhost:8000/cowbell.wav',
})


var piano = new Wad({source:'sine', env:{attack:.005, decay:.2, sustain:.8, hold:4, release:.3}, filter : {type:'lowpass', frequency:700}})

// var bass = new Wad({})

var voice = new Wad({ source : 'mic'})


var looper = new Wad.Poly({
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
    // recConfig : { 
    //     workerPath : '/src/Recorderjs/recorderWorker.js'
    // },
    // filter : {
    //     type : 'lowpass',
    //     frequency : 1300
    // }
})
var mt = new Wad.Poly({ 
    // recConfig : { 
    //     workerPath : '/src/Recorderjs/recorderWorker.js'
    // },
    // reverb : { 
    //     impulse :'http://localhost:8000/widehall.wav',
    //     wet : .15
    // },
    callback : function(that){
        that.add(kick).add(hat).add(snare).add(piano).add(voice)
    }
})
// var lfo = new Wad({source:'sine', volume: 1.5, destination: mt.delay.feedbackNode.gain})
// lfo.play({pitch: 1})


// mt.add(voice)


var alpha = new Wad({
    source : 'sawtooth',
    env : {
        hold : 2,
        attack : .02,
        release : .3
    },
    panning : -10
})
mt.add(alpha)

var app = { 
    panning : [0, 0, 4],
    detune : 0,
    rig : {
        alpha : alpha,
        mode : 'alpha'
    }
}

//////////////////////////
app.foo = function(){
    looper.delay.feedbackNode.disconnect();
}
// Animation / UI stuff goes here
app.bar = function(){
    looper.delay.feedbackNode.connect(looper.delay.delayNode)

}
app.reset = function(){
    console.log('hi')
    app.foo()
    setTimeout(function(){app.bar()},30)
}

$metronome = $('#metronome')
$one       = $('.one')
$two       = $('.two')
$three     = $('.three')
$four      = $('.four')

var animateFrame = function(){
    var now = performance.now()
    var progressInBeat = ( ( ( now - start ) % beat ) / beat )
    var progressInLoop = ( ( ( now - start ) % ( beat * 4 ) ) / ( beat * 4 ) )
    // console.log(progressInLoop)

    if      ( ( progressInLoop > .00 ) && ( progressInLoop < .25 ) ) { $one.addClass('on'); $four.removeClass('on') }
    else if ( ( progressInLoop > .25 ) && ( progressInLoop < .50 ) ) { $two.addClass('on'); $one.removeClass('on') }
    else if ( ( progressInLoop > .50 ) && ( progressInLoop < .75 ) ) { $three.addClass('on'); $two.removeClass('on') }
    else if ( ( progressInLoop > .75 ) && ( progressInLoop < 1.0 ) ) { $four.addClass('on'); $three.removeClass('on') }

    $metronome.css('transform', 'rotate(' + (( progressInBeat * 360 ) - 90 ) + 'deg)')

    requestAnimationFrame(animateFrame)
}
$micOn = $('#micOn')
var logPitch = function(){
    $micOn.text(mt.noteName + ' : ' + mt.pitch)
    requestAnimationFrame(logPitch)
}

////////////////////////////////



var saw = new Wad({source:'sawtooth', volume : 2, env : { attack : .051, hold : 1.33, release : .3 }})
var triangle = new Wad({source:'triangle', volume : .2, env : { attack : .1, hold : .3, release : .3 }})
Wad.midiInstrument = piano

// using octave shift, so lowest note is [144, 60, 1]
// I need to make sure that the keyboard is shifted up one octave.
var midiRig25 = function(event){
    console.log(event.receivedTime, event.data)


    if ( event.data[0] === 128 && event.data[1] === 48 && event.data[2] === 0 ) { app.rig.mode = 'alpha' }
    if ( event.data[0] === 128 && event.data[1] === 49 && event.data[2] === 0 ) { app.rig.mode = 'beta'  }
    if ( event.data[0] === 128 && event.data[1] === 50 && event.data[2] === 0 ) { app.rig.mode = 'gamma' }
    if ( event.data[0] === 128 && event.data[1] === 51 && event.data[2] === 0 ) { app.rig.mode = 'delta' }

    if      ( app.rig.mode === 'alpha' ) {

        if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
            app.rig.alpha.stop(Wad.pitchesArray[event.data[1]-12])
        }

        else if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
            app.rig.alpha.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, panning: app.panning, callback : function(that){
            }})
            console.log(app.detune)
        }
        else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
            console.log('pitch bend')
            console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
            saw1.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
            app.detune =    ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            // console.log(app.detune)
        }
        else if ( event.data[0] === 176 && event.data[1] === 22 ) {
            app.panning[0] = ( event.data[2] - 64 ) * ( 10 / 64 )
            alpha.setPanning(app.panning)
            console.log('panning: ', app.panning)
        }
    }

    else if ( app.rig.mode === 'beta' ) {
        if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
            Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-24])
        }
        if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
            Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-24], label : Wad.pitchesArray[event.data[1]-24], detune : app.detune, callback : function(that){
            }})
        }
    }


    else if ( app.rig.mode === 'gamma' ) {
        console.log('gamma') 
        if ( event.data[0] === 144 && event.data[1] >= 60 ) { // stop note.
            if      ( event.data[1] === 60 ) { console.log() }
        //     else if ( event.data[1] === 61 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 62 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 63 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 64 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 65 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 66 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 67 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 68 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 69 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 70 ) { foo.play({ volume : , env : { attack : } }); }
        //     else if ( event.data[1] === 71 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 72 ) { hat.play({ volume : 1 }); }
            else if ( event.data[1] === 73 ) { hatOpen.play({ volume : 1 }); }
            else if ( event.data[1] === 74 ) { kick.play({ volume : 1 }); }
        //     else if ( event.data[1] === 75 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 76 ) { snare.play({ volume : 1 }); }
            else if ( event.data[1] === 77 ) { lowTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 78 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 79 ) { midTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 80 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 81 ) { highTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 82 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 83 ) { cowbell.play({ volume : 1 }); }
            else if ( event.data[1] === 84 ) { crash.play({ volume : 1 }); }
        }
    }

    else if ( app.rig.mode === 'delta' ) {
        console.log('delta') 
    }
}

var midiRig88 = function(event){
    console.log(event.receivedTime, event.data)
    if ( event.data[0] === 128 ) {
        Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
    }
    else if ( event.data[0] === 144 ) { // 144 means the midi message has note data
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
            var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, callback : function(that){
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
        app.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
    }
}
//////////////////////////////////////////////////////////////////





$(document).ready(function(){


    animateFrame()


    $('#micOn').on('click', function(){
        voice.play()
        mt.updatePitch()
        logPitch()
    })

    // if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRig88 }
    // else { setTimeout(function(){ Wad.midiInputs[0].onmidimessage = midiRig88 }, 100)}

    if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRig25 }
    else { setTimeout(function(){ Wad.midiInputs[0].onmidimessage = midiRig25 }, 100)}

    var looping = false
    $(document).on('keydown', function(event){
        console.log(event)
        if ( event.which === 32 ) {
            looping = !looping
            if ( looping ) { looper.add(mt) }
            else if ( !looping ) {looper.remove(mt) }
        }
        // else if ( event.which === 93 || event.which === 91 ) {
        //     app.reset();
        // }
    })

    $('#reset').on('click', function(){
        app.reset()
    })

    $('.note').on('mousedown', function(){
        piano.play({ pitch : $(this).text() })
    })
    $('.note').on('mouseup', function(){
        piano.stop()
        console.log(mt.noteEstimate)
    })
    $('.mixer-track').on('click', function(){
        $('.mixer-track').removeClass('selected')
        $(this).addClass('selected')
    })

})