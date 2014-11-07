// Timing stuff goes here
var bpm = 100 // beats per minute
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

var hatOpen = new Wad({
    source : 'http://localhost:8000/hatOpen.wav'
})
// var snare = new Wad({ source : 'noise', volume : 6, env : {attack : .001, decay : .01, sustain : .2, hold : .03, release : .02}, filter : {type : 'bandpass', frequency : 300, q : .180 }, delay : { delayTime : .05} })
var snare = new Wad({
    source : 'http://localhost:8000/snare.wav',
    delay  : {
        delayTime : .1,
        feedback  : .6,
        wet       : 0.01
    }
})


// var crash = new Wad({})
// var highTom = new Wad({})
// var midTom = new Wad({})
// var lowTom = new Wad({})
var cowbell = new Wad({
    source : 'http://localhost:8000/cowbell.wav',
})


// var piano = new Wad({source:'sine', env:{attack:.005, decay:.2, sustain:.8, hold:4, release:.3}, filter : {type:'lowpass', frequency:700}})

// var bass = new Wad({})

var voice = new Wad({ 
    source : 'mic',
    filter : {
        type : 'highpass',
        frequency : 600
    }
})


var alpha = new Wad({
    source  : 'sawtooth',
    env     : {
        hold    : 3,
        attack  : 0.02,
        release : 0.3,
        sustain : .6,
        decay   : .1
    },
    // panning : -10
})

var beta = new Wad({
    source : 'sawtooth',
    env    : {
        attack : .02,
        decay  : .2,
        sustain : .8,
        hold    : 4,
        release : .1
    },
    filter : { // slap
        type : 'lowpass',
        frequency : 1700,
        env : {
            attack : .4,
            frequency : 400
        }
    }
    // filter : { // pop
    //     type : 'lowpass',
    //     frequency : 700,
    //     q    : 3,
    //     env : {
    //         attack : .4,
    //         frequency : 1400
    //     }
    // }
})

var app = { 
    panning : [0, 0, 4],
    detune : 0,
    rig : {
        alpha     : alpha,
        beta      : beta,
        mode      : 'gamma',
        pedalDown : false
    }
}

looper = new Wad.Poly({
    // reverb : {
    //     wet : .8,
    //     impulse : 'http://localhost:8000/widehall.wav'
    // },
    delay : {
        delayTime: b(16),
        maxDelayTime: 20,
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
    reverb : { 
        impulse :'http://localhost:8000/widehall.wav',
        wet : .11
    },
    // delay   : {
    //     delayTime : .3,  // Time in seconds between each delayed playback.
    //     wet       : .1, // Relative volume change between the original sound and the first delayed playback.
    //     feedback  : .45, // Relative volume change between each delayed playback and the next. 
    // },

    callback : function(that){
        that.add(kick).add(hat).add(hatOpen).add(snare).add(voice).add(cowbell).add(alpha).add(beta)
    }
})
// var lfo = new Wad({source:'sine', volume: 1.5, destination: mt.delay.feedbackNode.gain})
// lfo.play({pitch: 1})




//////////////////////////


// Animation / UI stuff goes here
app.foo = function(){
    looper.delay.delayNode.disconnect();
}
app.bar = function(){
    looper.delay.delayNode.connect(looper.delay.feedbackNode)
    looper.delay.delayNode.connect(looper.delay.wetNode)

}
app.reset = function(){
    app.foo()
    setTimeout(function(){app.bar()},100)
}


$metronome = $('#metronome')
var beatBoxes = [
    $('.b1'),
    $('.b2'),
    $('.b3'),
    $('.b4'),
    $('.b5'),
    $('.b6'),
    $('.b7'),
    $('.b8'),
    $('.b9'),
    $('.b10'),
    $('.b11'),
    $('.b12'),
    $('.b13'),
    $('.b14'),
    $('.b15'),
    $('.b16'),
]

var start;
var animateFrame = function(){
    var now = performance.now()
    var progressInBeat = ( ( ( now - start ) % beat ) / beat )
    var progressInLoop = ( ( ( now - start ) % ( beat * 16 ) ) / ( beat * 16 ) )
    console.log(Math.floor(progressInLoop / 0.0625) + 1)
    if      ( Math.floor(progressInLoop / 0.0625) > 0 ) {
        beatBoxes[ Math.floor(progressInLoop / 0.0625) ].addClass('on')
        beatBoxes[ Math.floor(progressInLoop / 0.0625) - 1 ].removeClass('on')
    }
    else if ( Math.floor(progressInLoop / 0.0625) === 0 ) {
        beatBoxes[0].addClass('on')
        beatBoxes[15].removeClass('on')
    }
    // if      ( ( progressInLoop > .00 ) && ( progressInLoop < .25 ) ) { $one.addClass('on'); $four.removeClass('on') }
    // else if ( ( progressInLoop > .25 ) && ( progressInLoop < .50 ) ) { $two.addClass('on'); $one.removeClass('on') }
    // else if ( ( progressInLoop > .50 ) && ( progressInLoop < .75 ) ) { $three.addClass('on'); $two.removeClass('on') }
    // else if ( ( progressInLoop > .75 ) && ( progressInLoop < 1.0 ) ) { $four.addClass('on'); $three.removeClass('on') }

    $metronome.css('transform', 'rotate(' + (( progressInBeat * 360 ) - 90 ) + 'deg)')

    requestAnimationFrame(animateFrame)
}

var $micInfo = $('#micInfo')
var logPitch = function(){
    if ( mt.noteName && mt.pitch ) {
        $micInfo.text(mt.noteName + ' : ' + mt.pitch + ' hz')
    }
    app.pitchDetectRaf = requestAnimationFrame(logPitch)
}

////////////////////////////////



// var saw = new Wad({source:'sawtooth', volume : 2, env : { attack : .051, hold : 1.33, release : .3 }})
// var triangle = new Wad({source:'triangle', volume : .2, env : { attack : .1, hold : .3, release : .3 }})
// Wad.midiInstrument = piano

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
            if ( app.rig.pedalDown === false ) {
                app.rig.alpha.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, panning: app.panning, volume : 2.5 })
            }
            else {
                app.rig.alpha.play({
                    volume : .5,
                    pitch : Wad.pitchesArray[event.data[1]-12], 
                    label : Wad.pitchesArray[event.data[1]-12], 
                    detune : app.detune, panning: app.panning,
                    env    : {
                        attack  : .4,
                        sustain : 1,
                        decay   : 0
                    } 
                })
            }
            console.log(app.detune)
        }
        else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
            console.log('pitch bend')
            console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
            alpha.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
            app.detune =    ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            // console.log(app.detune)
        }
        else if ( event.data[0] === 176 && event.data[1] === 22 ) {
            app.panning[0] = ( event.data[2] - 64 ) * ( 10 / 64 )
            alpha.setPanning(app.panning)
            console.log('panning: ', app.panning)
        }
        if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
            app.rig.pedalDown = true
            console.log(app.rig.pedalDown)
        }
        else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
            app.rig.pedalDown = false
            console.log(app.rig.pedalDown)
        }
    }

    else if ( app.rig.mode === 'beta' ) {
        if ( event.data[0] === 128 && event.data[1] >= 60 ) { // stop note.
            app.rig.beta.stop(Wad.pitchesArray[event.data[1]-48])
        }
        if ( event.data[0] === 144 && event.data[1] >= 60 ) { // note data
            if ( app.rig.pedalDown === false ) {
                app.rig.beta.play({
                    pitch : Wad.pitchesArray[event.data[1]-48], 
                    label : Wad.pitchesArray[event.data[1]-48], 
                    detune : app.detune,
                    panning : app.panning,
                    env : {
                        release : .5
                    },
                    filter : { // slap
                        type : 'lowpass',
                        frequency : 1700,
                        env : {
                            attack : .3,
                            frequency : 400
                        }
                    } 
                })
            }
            else if ( app.rig.pedalDown === true ) {
                app.rig.beta.play({
                    volume : 2.2,
                    panning : app.panning,
                    pitch : Wad.pitchesArray[event.data[1]-48], 
                    label : Wad.pitchesArray[event.data[1]-48], 
                    detune : app.detune,
                    env : {
                        attack : .02,
                        decay  : .02,
                        sustain : .5,
                        release : .4
                    },
                    filter : { // pop
                        type : 'lowpass',
                        frequency : 1700,
                        q : 1.5,
                        env : {
                            attack : .1,
                            frequency : 400
                        }
                    }
                })
            }
            else if ( event.data[0] === 176 && event.data[1] === 22 ) {
                app.panning[0] = ( event.data[2] - 64 ) * ( 10 / 64 )
                beta.setPanning(app.panning)
                console.log('panning: ', app.panning)
            }
        }

        if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
            app.rig.pedalDown = true
            console.log(app.rig.pedalDown)
        }
        else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
            app.rig.pedalDown = false
            console.log(app.rig.pedalDown)
        }

        else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
            console.log('pitch bend')
            console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
            beta.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 2 )
            app.detune =    ( event.data[2] - 64 ) * ( 100 / 64 ) * 2
            // console.log(app.detune)
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
            else if ( event.data[1] === 72 ) {
                console.log('data: ', ( event.data[2] * ( .2 / 127 ) + 1 ) )
                hat.play({
                    volume : ( event.data[2] * ( .2 / 127 ) + 1 ),
                    env : {
                        attack : ( event.data[2] * ( .01 / 127 ) * .8 )
                    },
                    filter : {
                        frequency : ( event.data[2] * ( 100 / 127 ) * 8 ) + 300,
                        q         : ( event.data[2] * ( 10 / 127 ) * .7 )
                    }
                }); 
            }
            else if ( event.data[1] === 73 ) { hatOpen.play({ volume : 1 }); }
            else if ( event.data[1] === 74 ) { kick.play({ volume : .81 }); }
        //     else if ( event.data[1] === 75 ) { foo.play({ volume : , env : { attack : } }); }
            else if ( event.data[1] === 76 ) {
                if ( app.rig.pedalDown === false ) { snare.play({ volume : 1 })}
                else {  
                    snare.play({ 
                        volume : 1,
                        env    : {
                            attack : .01
                        },
                        delay  : {
                            wet : .9
                        } 
                    }); 
                }
            }
            else if ( event.data[1] === 77 ) { cowbell.play({ volume : 2.7, panning: app.panning }); }
            // else if ( event.data[1] === 79 ) { lowTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 78 ) { foo.play({ volume : , env : { attack : } }); }
            // else if ( event.data[1] === 81 ) { midTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 80 ) { foo.play({ volume : , env : { attack : } }); }
            // else if ( event.data[1] === 83 ) { highTom.play({ volume : 1 }); }
        //     else if ( event.data[1] === 82 ) { foo.play({ volume : , env : { attack : } }); }
            // else if ( event.data[1] === 84 ) { crash.play({ volume : 1 }); }
        }

        else if ( event.data[0] === 176 && event.data[1] === 22 ) {
            app.panning[0] = ( event.data[2] - 64 ) * ( 10 / 64 )
            // cowbell.setPanning(app.panning)
            console.log('panning: ', app.panning)
        }
        if      ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 127 ) { // pedal data
            app.rig.pedalDown = true
            console.log(app.rig.pedalDown)
        }
        else if ( event.data[0] === 176 && event.data[1] === 64 && event.data[2] === 0 ) {
            app.rig.pedalDown = false
            console.log(app.rig.pedalDown)
        }
    }

    else if ( app.rig.mode === 'delta' ) {
        console.log('delta') 
    }
}

// var midiRig88 = function(event){
//     console.log(event.receivedTime, event.data)
//     if ( event.data[0] === 128 ) {
//         Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
//     }
//     else if ( event.data[0] === 144 ) { // 144 means the midi message has note data
//         // console.log('note')
//         if ( event.data[1] === 36 && event.data[2] > 0 ) { hat.play() }
//         else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         else if ( event.data[1] === 40 && event.data[2] > 0 ) { snare.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }
//         // else if ( event.data[1] === 38 && event.data[2] > 0 ) { kick.play() }

//         else if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
//             console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
//             Wad.midiInstrument.stop(Wad.pitchesArray[event.data[1]-12])
//         }
//         else if ( event.data[2] > 0 ) {
//             console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
//             var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
//             Wad.midiInstrument.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : app.detune, callback : function(that){
//             }})
//         }
//     }
//     else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
//         console.log('controller')
//         if ( event.data[1] == 64 ) {
//             if ( event.data[2] == 127 ) { looper.add(mt) ; console.log('on')}
//             else if ( event.data[2] == 0 ) { looper.remove(mt); console.log('off')}
//         }
//     }
//     else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
//         console.log('pitch bend')
//         console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
//         Wad.midiInstrument.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
//         app.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
//     }
// }
//////////////////////////////////////////////////////////////////





$(document).ready(function(){


    $('#start').on('click', function(){
        $('.beatBox').removeClass('on')
        $(this).text('Restart')
        start = performance.now() -16000
        animateFrame()
    })


    $('#micOn').on('click', function(){
        if ( $(this).hasClass('micOn') ) {
            $(this).removeClass('micOn')
            $(this).text('Mic On')
            voice.stop()
        }
        else {
            $(this).addClass('micOn')
            $(this).text('Mic Off')
            voice.play()
        }
    })

    $('#detectPitch').on('click', function(){
        if ( $(this).hasClass('detecting') ) {
            $(this).removeClass('detecting')
            $(this).text('Detect Pitch')
            mt.stopUpdatingPitch()
            cancelAnimationFrame(app.pitchDetectRaf)
            $micInfo.text('')
        }
        else {
            $(this).addClass('detecting')
            $(this).text('Stop Detecting')
            mt.updatePitch()
            logPitch()
        }
    })
    // if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRig88 }
    // else { setTimeout(function(){ Wad.midiInputs[0].onmidimessage = midiRig88 }, 100)}

    if ( Wad.midiInputs[0] ) { Wad.midiInputs[0].onmidimessage = midiRig25 }
    else { setTimeout(function(){ Wad.midiInputs[0].onmidimessage = midiRig25 }, 100)}

    var looping = false
    $(document).on('keydown', function(event){
        console.log(event)
        if ( event.which === 49 ) {
            looping = !looping
            if ( looping ) { looper.add(mt); $('#record').addClass('selected') }
            else if ( !looping ) {looper.remove(mt); $('#record').removeClass('selected') }
                console.log(looping)
        }
        // else if ( event.which === 93 || event.which === 91 ) {
        //     app.reset();
        // }
        // if ( event.which >= 49 && event.which <= 56 ) { //for multi-track mixer

        //     var $selectedTrack = $('.mixer-track:nth-child(' + (event.which - 48) + ')')
        //     if ( $selectedTrack.hasClass('selected') ) {
        //         $selectedTrack.removeClass('selected')
        //     }
        //     else {
        //         $('.mixer-track').removeClass('selected')
        //         $selectedTrack.addClass('selected')
        //     }
        // }
    })

    $('#reset').on('click', function(){
        console.log('reset')
        app.reset()
    })

    $('.note').on('mousedown', function(){
        piano.play({ pitch : $(this).text() })
    })
    $('.note').on('mouseup', function(){
        piano.stop()
        // console.log(mt.noteEstimate)
    })
    // $('.mixer-track').on('click', function(){
    //     $('.mixer-track').removeClass('selected')
    //     $(this).addClass('selected')
    // })

})