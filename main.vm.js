
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
            instruments: {
                alpha: {
                    source:'square',
                    filter  : {
                        type      : 'lowpass', 
                    },
                },
                beta: '4'
            }
        }, // (L)ocal (S)torage data
        instruments : {
            alpha: null,
            beta : null,
            gamma : null,
            delta: null,
            epsilon: null,
        }

    },
    created: function(){
        var thatVm = this
        window.addEventListener('beforeunload', thatVm.beforeunload)
        // if ( localStorage.loopData ) {
        //     thatVm.ls = JSON.parse(localStorage.loopData)
        // }

        thatVm.instruments.alpha = new Wad(thatVm.ls.instruments.alpha)


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