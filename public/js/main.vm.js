
var tick = new Wad({source:'audio/hatClosed.wav'})
var mainVm = new Vue({
    el: '#vue-root',
    data: {
        ls: looperConfig, // (L)ocal (S)torage data
        instruments: { // individual wads, which cannot be serialized
            alpha: null, // pianoish
            ALPHA: null, // pianoish
            beta : null, // bass
            BETA : null, // bass
            gamma : null, // synth
            GAMMA : null, // synth
            delta: {
                kick: null,
                snare: null,
            }, // a drum kit. an array of wads
            epsilon: null, // microphone
            EPSILON: null, // microphone
            metronome: null, // probably a single closed hat
        },
        nodes: { // individual web audio nodes, which cannot be serialized
            preDest: null, 
            soundSources: null,
        },
        hotkeys: {
            record: false,
            schedule: false,
            delete: false,
        },
        loopTrackMidiKeys: [24, 26, 28, 29, 31, 33, 35], // the midi key codes for the keys to control the loop tracks
        instrumentMidiKeys: [25, 27, 30, 32, 34],
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
        thatVm.instruments.ALPHA = new Wad(thatVm.ls.instruments.ALPHA)

        thatVm.instruments.beta = new Wad(thatVm.ls.instruments.beta)
        thatVm.instruments.BETA = new Wad(thatVm.ls.instruments.BETA)

        thatVm.instruments.gamma = new Wad(thatVm.ls.instruments.gamma)
        thatVm.instruments.GAMMA = new Wad(thatVm.ls.instruments.GAMMA)

        thatVm.instruments.epsilon = new Wad(thatVm.ls.instruments.epsilon)
        thatVm.instruments.EPSILON = new Wad(thatVm.ls.instruments.EPSILON)

        thatVm.instruments.delta.c1 = new Wad(thatVm.ls.instruments.delta.c1)

        thatVm.nodes.preDest = new Wad.Poly()
        for ( var i=0; i < thatVm.ls.config.numLoopTracks; i++ ) {

            var loopTrack = new Wad.Poly({
                delay : {
                    delayTime: (thatVm.ls.clock.beatsPerBar * thatVm.ls.clock.barsPerLoop * thatVm.ls.clock.beatLen) / 1000,
                    maxDelayTime: 40,
                    feedback : 1,
                    wet      : 1
                },
            })
            loopTrack.output.fftSize = 256
            var bufferLength = loopTrack.output.frequencyBinCount
            var dataArray = new Uint8Array(bufferLength)
            var state = {
                muted      : false, 
                recording  : false,
                scheduled  : { // state is scheduled to change to at the start of each loop
                    muted     : false,
                    recording : false,
                },
                dataArray : dataArray,
                volume: 0,
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
                    .add(thatVm.instruments.ALPHA)
                    .add(thatVm.instruments.beta)
                    .add(thatVm.instruments.BETA)
                    .add(thatVm.instruments.gamma)
                    .add(thatVm.instruments.GAMMA)
                    .add(thatVm.instruments.epsilon)
                    .add(thatVm.instruments.EPSILON)
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
            console.log(event, event.data)
            var thatVm = this
            // if ( event.data[0] === 128 ) { // my 88key keyboard doesn't indicate stop this way
            //     thatVm.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
            // }
            if ( event.data[0] === 144 ) { // 144 means the midi message has note data
                this.handleKeyEventData(event)
            }
            else if ( [176, 224].includes(event.data[0]) ) { // 176 or 224 means the midi message has controller data
                this.handleControllerEventData(event)
            }
        },
        handleKeyEventData: function(event){ // the user pressed a key on the midi keyboard
            if ( event.data[1] < 36 ) {
                this.handleAdminKeyEventData(event)
            }
            else if ( event.data[1] >= 36 ) {
                console.log('play notes')
                this.handleNoteKeyEventData(event)

            }
        },
        handleAdminKeyEventData: function(event){
            // admin stuff
            console.log('do admin stuff')

            if ( event.data[1] === 21 ){
                if ( event.data[2] > 0 ) {
                    console.log('delete...')
                    this.hotkeys.delete = true
                    if ( this.hotkeys.schedule && this.hotkeys.record ) {
                        this.toggleMetronome()
                    }
                }
                else if ( event.data[2] === 0 ) {
                    this.hotkeys.delete = false
                }
            }
            if ( event.data[1] === 22 ){
                if ( event.data[2] > 0 ) {
                    console.log('schedule...')
                    this.hotkeys.schedule = true
                    if ( this.hotkeys.delete && this.hotkeys.record ) {
                        this.toggleMetronome()
                    }
                }
                else if ( event.data[2] === 0 ) {
                    this.hotkeys.schedule = false
                }
            }
            if ( event.data[1] === 23 ){
                if ( event.data[2] > 0 ) {
                    console.log('record...')
                    this.hotkeys.record = true
                    if ( this.hotkeys.delete && this.hotkeys.schedule ) {
                        this.toggleMetronome()
                    }
                }
                else if ( event.data[2] === 0 ) {
                    this.hotkeys.record = false
                }
            }


            else if ( this.loopTrackMidiKeys.includes(event.data[1]) ) {
                console.log('a track key')
                if ( this.hotkeys.record  && event.data[2] > 0 ) {
                    this.recordToTrack(this.loopTrackMidiKeys.indexOf(event.data[1]))
                }
            }

            // SWITCHING INSTRUMENTS
            else if ( this.instrumentMidiKeys.includes(event.data[1]) ) {
                console.log('switch instruments')
                if      ( event.data[1] == this.instrumentMidiKeys[0] ) {
                    this.switchInstruments('alpha')
                }
                else if ( event.data[1] == this.instrumentMidiKeys[1] ) {
                    this.switchInstruments('beta')
                }
                else if ( event.data[1] == this.instrumentMidiKeys[2] ) {
                    this.switchInstruments('gamma')
                }
                else if ( event.data[1] == this.instrumentMidiKeys[3] ) {
                    this.switchInstruments('delta')
                }
                else if ( event.data[1] == this.instrumentMidiKeys[4] ) {
                    this.switchInstruments('epsilon')

                }
            }
        },
        handleNoteKeyEventData: function(event){
            if ( this.ls.activeInstrument === 'alpha' ) {
                console.log('play alpha notes')
                this.handleAlphaNoteKeyEventData(event)
            }
            if ( this.ls.activeInstrument === 'beta' ) {
                this.handleBetaNoteKeyEventData(event)
                
            }
            if ( this.ls.activeInstrument === 'gamma' ) {
                this.handleGammaNoteKeyEventData(event)
                
            }
            if ( this.ls.activeInstrument === 'delta' ) {
                this.handleDeltaNoteKeyEventData(event)
                
            }
            if ( this.ls.activeInstrument === 'epsilon' ) {
                this.handleEpsilonNoteKeyEventData(event)
            }

        },
        handleAlphaNoteKeyEventData: function(event){
            if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
                this.instruments.alpha.stop(Wad.pitchesArray[event.data[1]-12])
            }
            else if ( event.data[2] > 0 ) {
                console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
                this.instruments.alpha.play({
                    volume : .3,
                    pitch : Wad.pitchesArray[event.data[1]-12], 
                    label : Wad.pitchesArray[event.data[1]-12], 
                    detune : this.ls.knobs.detune, 
                    callback : function(that){ }
                })
            }
        },
        handleBetaNoteKeyEventData: function(event){
            if ( event.data[2] === 0 ) { // noteOn velocity of 0 means this is actually a noteOff message
                console.log('|| stopping note: ', Wad.pitchesArray[event.data[1]-12])
                this.instruments.beta.stop(Wad.pitchesArray[event.data[1]-24])
            }
            else if ( event.data[2] > 0 ) {
                console.log('> playing note: ', Wad.pitchesArray[event.data[1]-12])
                var detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
                this.instruments.beta.play({
                    volume : .3,
                    pitch : Wad.pitchesArray[event.data[1]-24], 
                    label : Wad.pitchesArray[event.data[1]-24], 
                    detune : this.ls.knobs.detune, 
                    callback : function(that){ }
                })
            }
        },
        handleGammNoteKeyEventData: function(event){

        },
        handleDeltaNoteKeyEventData: function(event){

        },
        handleEpsilonNoteKeyEventData: function(event){

        },
        handleControllerEventData: function(event){
			if ( event.data[0] === 224 ) {
				if ( event.data[2] === 125 ) { event.data[2] = 128 }// bugfix for my keyboard. it only goes up to 125
				if ( this.ls.activeInstrument === 'alpha' ) {
					this.ls.knobs.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 12
					this.instruments.alpha.setDetune(this.ls.knobs.detune)
				}
				if ( this.ls.activeInstrument === 'beta' ) {
					this.ls.knobs.detune = ( event.data[2] - 64 ) * ( 100 / 64 ) * 2
					this.instruments.beta.setDetune(this.ls.knobs.detune)
				}
				if ( this.ls.activeInstrument === 'epsilon' ) {
					this.instruments.epsilon.filter[0].node.frequency.setValueAtTime(200 + (4*event.data[2]), Wad.audioContext.currentTime)
				}
			}
			if ( event.data[0] === 176 ) {
				if ( this.ls.activeInstrument === 'epsilon' ) {
					this.instruments.epsilon.setPanning( (event.data[2]-64) * (1/64) )  
				}
			}
        },
        switchInstruments: function(instrument){
            if ( this.ls.activeInstrument == instrument ) {
                console.log("Can't switch to the same instrument.")
                return
            }
            this.ls.activeInstrument = instrument
			console.log(this.ls.activeInstrument)
            if ( instrument == 'epsilon' ) {
                this.instruments.epsilon.play()
            }
            else {
                // but how do we keep the mic on while playing other instruments?
                console.log('stop the mic')
                this.instruments.epsilon.stop()
            }
        },
        modifyInstrument: function(isModified){
            if ( ifModified ) {
                this.ls.activeInstrument = this.ls.activeInstrument.toUpperCase()
            }
            else if ( !ifModified ) {
                this.ls.activeInstrument = this.ls.activeInstrument.toLowerCase()
            }
        }, 
        openTab: function(which){
            console.log(which)
            this.ls.currentTab = which
        },
        beforeunload: function(){
            localStorage.loopData = JSON.stringify(this.ls)
        },
        toggleMetronome: function(){
			this.ls.config.metronomeIsEnabled = !this.ls.config.metronomeIsEnabled
            console.log('...what\'s this do?')
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
            mainVm.ls.instruments[which].source = event.target.value
            mainVm.instruments[which].source    = event.target.value
        },
        recordToTrack : function(trackNum){
            var thatVm = this
            if ( thatVm.recordingTo == null ) { // start recording to this track
                console.log('recording to track ', trackNum)
                thatVm.recordingTo = trackNum
                thatVm.nodes.preDest.remove(thatVm.nodes.soundSources)
                thatVm.loopTracks[trackNum].wad.add(thatVm.nodes.soundSources)
                thatVm.loopTracks[trackNum].state.recording = true;

            }
            else if ( thatVm.recordingTo === trackNum ) { // stop recording on this track
                console.log('stopping recording to track ', trackNum)
                thatVm.recordingTo = null
                thatVm.loopTracks[trackNum].wad.remove(thatVm.nodes.soundSources)
                thatVm.nodes.preDest.add(thatVm.nodes.soundSources)
                thatVm.loopTracks[trackNum].state.recording = false;
            }
            else if ( thatVm.recordingTo !== trackNum ) { // stop recording on old track, start on this track
                console.log('stop rec on ', thatVm.recordingTo, ', start on ', trackNum)
                thatVm.loopTracks[thatVm.recordingTo].wad.remove(thatVm.nodes.soundSources)
                thatVm.loopTracks[thatVm.recordingTo].state.recording = false;
                // app.trackActions.updateTrackDOM(thatVm.recordingTo)
                thatVm.recordingTo = trackNum
                thatVm.loopTracks[trackNum].wad.add(thatVm.nodes.soundSources)
                thatVm.loopTracks[trackNum].state.recording = true;
            }
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
                    if ( this.ls.config.metronomeIsEnabled ) {
                        tick.play()
                    }
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

            // VOLUME VISUALISATION
            for ( var i = 0; i < this.loopTracks.length; i++ ) {
                var analyser = this.loopTracks[i].wad.output
                analyser.getByteFrequencyData(this.loopTracks[i].state.dataArray)
                var volume = this.loopTracks[i].state.dataArray.reduce(function(prev, cur){ return prev + cur })
                this.loopTracks[i].state.volume = volume
                if ( volume > 0 ) { console.log('volume? ', volume) }
                
            }
            // END VOLUME VISUALISATION

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
