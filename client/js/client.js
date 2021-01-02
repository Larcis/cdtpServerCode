//const socket = io();
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

function api_put(id, data){
    fetch("api/sera/"+id, {
        method: 'PUT',
        mode: 'same-origin',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
          //'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(s => console.log(s));
}

var socket = io();
Vue.use(VueSocketIOExt, socket);

Vue.component('sera', {
    props: ["obj"],
    data(){
        return { 
            change_sp: false,
            busy: false
        }
    },
    methods:{ 
        toggleChangeSp(){
            this.change_sp = !this.change_sp;
            if(!this.change_sp){
                api_put(this.obj._id, { set_point: this.obj.sp });
            }
        },
        spChanged(e){
            this.obj.sp = parseFloat(e.target.value);
        },
        toggleIsOn(){
            this.obj.is_on = !this.obj.is_on
            api_put(this.obj._id, { is_on: this.obj.is_on });
        }
    },
    template: 
        `<div class="row">
            <div class="cell center" v-html="obj._id"></div>
            <div class="cell center" v-html="obj.name"></div>
            <div class="cell center" >
                <i @click="toggleIsOn" v-if="obj.is_on==false" class="fas fa-power-off fa-lg" style="color: orange;"></i>
                <i @click="toggleIsOn" v-else class="fas fa-power-off fa-lg" style="color: lightgreen;"></i>
            </div>
            <div class="cell center" style="flex-direction:row;display:flex;">
                <input @change="spChanged" v-bind:disabled="!change_sp" type="number" v-bind:value="obj.sp" style="flex:3;height: 90%;"/>
                <button @click="toggleChangeSp()" style="flex:1;height: 100%;background-color:var(--blue);"><i style="color:  var(--white);" class="far fa-edit fa-lg"></i></button>
            </div>
            <div class="cell center" v-html="obj.temp"></div>
        <div>`
})


new Vue({
    el: "#app",
    data(){
        return {
            greenHouses: []
        }
    },
    sockets: {
        connect() {
            console.log('socket connected')
        },
        temperatureChanged(msg) {
            let idx = this.findIdx(msg.id);
            //console.log("temperatureChanged", idx)
            if (idx != -1) {
                this.greenHouses[idx].temp = msg.temperature;
            }
        },
        newSetPoint(msg){
            let idx = this.findIdx(msg.id);
            //console.log("newSetPoint", idx)
            if (idx != -1) {
                this.greenHouses[idx].sp = msg.set_point;
            }
        },
        isOn(msg){
            let idx = this.findIdx(msg.id);
            //console.log("isOn", idx)
            if (idx != -1) {
                this.greenHouses[idx].is_on = msg.is_on;
            }
        }
    },  
    created: function(){
        console.log("yaratıldım")
        fetch('/api/all').then(response => response.json())
        .then(data => {
            for(let i = 0; i < data.length; i++) {
                data[i].temp = data[i].temperature.last();
                data[i].sp = data[i].set_point.last();
                data[i].sp_ready = false;
                data[i].idx = i;
            }
            
            this.greenHouses = data
            console.log(this.greenHouses)

        });
    },
    mounted: function(){
        let clickables = document.getElementsByClassName("clickable");
        console.log(clickables.length)
        /*clickables[0].classList.remove("clickable");
        clickables[1].classList.remove("clickable");*/
    },
    methods: {
        
        clickButton(val) {
            this.$socket.client.emit('temperatureChanged', document.getElementById('myInput').value);
        },
        findIdx(id) {
            for (let i = 0; i < this.greenHouses.length; i++) {
                if (this.greenHouses[i]._id == id) {
                    return i;
                }
            }
            return -1;
        }
    }
});

// document.getElementById("myInput").onchange = function(){
//     socket.emit('temperatureChanged', {id: "deneme_sera", temperature: parseFloat(document.getElementById('myInput').value)});
// }