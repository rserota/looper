
var tick = new Wad({source:'audio/hatClosed.wav'})
var mainVm = new Vue({
    el: '#vue-root',
    data: {
        ls: {
            clock: {
                start: 0,
                prevBeat: 0,
                curBeat: 0,
                beatsPerBar: 4,
                barsPerLoop: 2,
                beatLen: 1000,
            },
            sliders: {
                beatLen: 20
            },
            knobs: { // keeps track of the last known position of the physical knobs on the keyboard
                volume: 0,
                pitchBend: 0,
                modulation: 0,

            },
            instruments: {
                alpha: {
                    source:'square',
                    env: {
                        attack: .01,
                        release: .3,
                    },
                    filter  : {
                        type      : 'lowpass', 
                        // env : { attack: .01 }
                    },
                },
                beta: '4'
            },
            config: {
                numLoopTracks: 7,
            },
        }, // (L)ocal (S)torage data
        instruments: { // individual wads, which cannot be serialized
            alpha: null, // pianoish
            beta : null, // bass
            gamma : null, // synth
            delta: {
                kick: null,
                snare: null,
            }, // a drum kit. an array of wads
            epsilon: null, // microphone
        },
        nodes: { // individual web audio nods, which cannot be serialized
            preDest: null, 
            soundSources: null,
        },
        loopTracks: [],
        recordingTo: null,

    },
    created: function(){
        var thatVm = this

        // if ( localStorage.loopData ) {
        //     thatVm.ls = JSON.parse(localStorage.loopData)
        // }

        // instrument setup 
        thatVm.instruments.alpha = new Wad(thatVm.ls.instruments.alpha)


        thatVm.nodes.preDest = new Wad.Poly()
        console.log('loop?')
        for ( var i=0; i < thatVm.ls.config.numLoopTracks; i++ ) {

            console.log('loop!')
            var loopTrack = new Wad.Poly({
                delay : {
                    delayTime: (thatVm.ls.clock.beatsPerBar * thatVm.ls.clock.barsPerLoop * thatVm.ls.clock.beatLen) / 1000,
                    maxDelayTime: 40,
                    feedback : 1,
                    wet      : 1
                },
            })
            var state = {
                muted     : false, 
                recording : false,
                scheduled : { // state is scheduled to change to at the start of each loop
                    muted     : false,
                    recording : false,
                }
            }
            thatVm.nodes.preDest.add(loopTrack)
            thatVm.loopTracks.push({wad: loopTrack, state: state})
        }

        thatVm.nodes.soundSources = new Wad.Poly({ 
            // reverb : { 
            //     impulse :'/audio/widehall.wav',
            //     wet : .11
            // },
            // delay   : {
            //     delayTime : .3,  // Time in seconds between each delayed playback.
            //     wet       : .1, // Relative volume change between the original sound and the first delayed playback.
            //     feedback  : .45, // Relative volume change between each delayed playback and the next. 
            // },
    
            callback : function(thatWad){
                thatWad
                    // .add(thatVm.instruments.delta.kick)
                    // .add(thatVm.instruments.delta.closedHihat)
                    // .add(thatVm.instruments.delta.openHihat)
                    // .add(thatVm.instruments.delta.snare)
                    // .add(thatVm.instruments.delta.cowbell)
                    // .add(thatVm.instruments.delta.crash)
                    // .add(thatVm.instruments.delta.highTom)
                    // .add(thatVm.instruments.delta.midTom)
                    // .add(thatVm.instruments.delta.lowTom)
                    .add(thatVm.instruments.alpha)
                    // .add(thatVm.instruments.beta)
                    // .add(thatVm.instruments.gamma);
                thatVm.nodes.preDest.add(thatWad)
            }
        })


        // midi setup
        if ( Wad.midiInputs[0] ) {
            Wad.midiInputs[0].onmidimessage = this.midiRig88
        }
        else {
            console.log("You're going to need a midi keyboard to use this app. ")
        }
        
        // bind event handlers
        window.addEventListener('beforeunload', thatVm.beforeunload)

    },
    computed: {
        beatBoxWidth: function(){
            return (100 / this.ls.clock.beatsPerBar) + '%'
        },
        beatsPerLoop: function(){
            return this.ls.clock.beatsPerBar * this.ls.clock.barsPerLoop
        },
    },
    methods: {
        midiRig88 : function(event){
            // console.log(event.receivedTime, event.data)
            var thatVm = this
            if ( event.data[0] === 128 ) {
                thatVm.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
            }
            else if ( event.data[0] === 144 ) { // 144 means the midi message has note data

                if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                    // console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
                    thatVm.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
                }
                else if ( event.data[2] > 0 ) {
                    // console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
                    var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
                    thatVm.instruments.alpha.play({pitch : Wad.pitchesArray[event.data[1]-12], label : Wad.pitchesArray[event.data[1]-12], detune : thatVm.ls.knobs.detune, callback : function(that){
                    }})
                }
            }
            // else if ( event.data[0] === 176 ) { // 176 means the midi message has controller data
            //     console.log('controller')
            //     if ( event.data[1] == 64 ) {
            //         if ( event.data[2] == 127 ) { looper.add(mt) ; console.log('on')}
            //         else if ( event.data[2] == 0 ) { looper.remove(mt); console.log('off')}
            //     }
            // }
            else if ( event.data[0] === 224 ) { // 224 means the midi message has pitch bend data
                console.log('pitch bend')
                console.log( ( event.data[2] - 64 ) * ( 100 / 64 ) )
                thatVm.instruments.alpha.setDetune( ( event.data[2] - 64 ) * ( 100 / 64 ) * 12 )
                thatVm.ls.knobs.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
            }
        },
        beforeunload: function(){
            localStorage.loopData = JSON.stringify(this.ls)
        },
        startClock: function(){
            if ( this.rafID ) {
                cancelAnimationFrame(this.rafID)
            }
            this.ls.clock.start = performance.now() + 1000
            this.animateFrame()
        },
        stopClock: function(){
            if ( this.rafID ) {
                cancelAnimationFrame(this.rafID)
            }
        },
        play: function(instrument){
            this.instruments[instrument].play()
        },
        resetApp: function(){
            localStorage.loopData = ''
            window.removeEventListener('beforeunload', this.beforeunload)
            window.location.reload()
        },
        changeSource: function(which, event){
            console.log(mainVm.instruments[which].source) 
            mainVm.instruments[which].source = event.target.value
        },
        recordToTrack : function(trackNum){
            if ( thatVm.recordingTo == null ) { // start recording to this track
                console.log('recording to track ', trackNum)
                thatVm.recordingTo = trackNum
                app.preDest.remove(app.soundSources)
                thatVm.loopTracks[trackNum].add(app.soundSources)
                thatVm.loopTracks[trackNum].state.recording = true;

            }
            else if ( thatVm.recordingTo === trackNum ) { // stop recording on this track
                console.log('stopping recording to track ', trackNum)
                thatVm.recordingTo = null
                thatVm.loopTracks[trackNum].remove(app.soundSources)
                app.preDest.add(app.soundSources)
                thatVm.loopTracks[trackNum].state.recording = false;
            }
            else if ( app.recordingTo !== trackNum ) { // stop recording on old track, start on this track
                console.log('stop rec on ', app.recordingTo, ', start on ', trackNum)
                thatVm.loopTracks[thatVm.recordingTo].remove(app.soundSources)
                thatVm.loopTracks[thatVm.recordingTo].state.recording = false;
                app.trackActions.updateTrackDOM(thatVm.recordingTo)
                thatVm.recordingTo = trackNum
                thatVm.loopTracks[trackNum].add(app.soundSources)
                thatVm.loopTracks[trackNum].state.recording = true;
            }
            app.trackActions.updateTrackDOM(trackNum)
        },
        animateFrame: function(){
            var now = performance.now()
            var clock = this.ls.clock
            var beatsPerLoop = clock.beatsPerBar * clock.barsPerLoop
            var progressInBeat = ( ( ( now - clock.start ) % clock.beatLen ) / clock.beatLen )
            var progressInLoop = ( ( ( now - clock.start ) % ( clock.beatLen * beatsPerLoop ) ) / ( clock.beatLen * beatsPerLoop ) )
            // console.log(Math.floor(progressInLoop / 0.0625) + 1)
            clock.prevBeat = clock.curBeat
            clock.curBeat = Math.floor(progressInLoop / ( 1 / beatsPerLoop )) + 1
            // console.log(progressInBeat)
            if ( clock.curBeat > 0 ) {
                if ( clock.curBeat < clock.prevBeat ) {
                    // first tic of first beat of loop
                    console.log('fire!')
                }
                if ( clock.curBeat != clock.prevBeat ) {
                    console.log('beat!',clock.curBeat)
                    tick.play()
                }
                if      ( Math.floor(progressInLoop / ( 1 / beatsPerLoop )) > 0 ) {
                    // console.log(Math.floor(progressInLoop / ( 1 / beatsPerLoop )) )
                    // not first beat of loop
                }
                else if ( Math.floor(progressInLoop / ( 1 / beatsPerLoop )) === 0 ) {
                    // first beat of loop
                    // console.log(this.curBeat)
                }

            }
            this.rafID = requestAnimationFrame(this.animateFrame)
        }
    },
    watch: {
        'ls.sliders.beatLen' : function(val){
            console.log(val)
            this.ls.clock.beatLen = val * val
        }
    }
})