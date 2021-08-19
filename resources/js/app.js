import axios from "axios";
import Noty from "noty";
import {initAdmin} from './admin';
import moment from "moment";

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('.cartCounter');

function updateCart(food){
    axios.post('/update-cart',food).then(res=>{
         //console.log(res);
         
          cartCounter.innerText = res.data.totalQty; 
          new Noty({

            type: "success",
            timeout: 1000,
            progressBar: false,
            layout: "topCenter", // 1 second
            text: "Item is Successfully added to your cart"
            
          }).show();
          
    }).catch(err =>{
        new Noty({
            type:'error',
            timeout: 1000,
            text: "something went wrong",
            progressBar:false
        })
    })

}

addToCart.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        
        let food = JSON.parse(btn.dataset.food);
        updateCart(food);
       
    })
})

// removing success order message after some time

const alertMsg = document.querySelector('#success-alert');
if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove()
    },2000);
};



// order status change

let statuses = document.querySelectorAll(".status_line")
let order = document.querySelector("#hiddenInput") ? document.querySelector("#hiddenInput").value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order){
    statuses.forEach((status)=>{
            status.classList.remove("step-completed");
            status.classList.remove("current-activity");
        })

    let stepCompleted = true;
    statuses.forEach((status)=>{
        let dataStatus = status.dataset.status;
        if(stepCompleted){
            status.classList.add("step-completed");
        }

        if(order.status === dataStatus){
            stepCompleted = false;
            time.innerText = moment(order.updateAt).format('hh:mm A')
            status.appendChild(time);
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add("current-activity");
            }
            
        }
    })
}

updateStatus(order);

// using socket in client side

let socket = io();

initAdmin(socket);
   // join
if(order){
    socket.emit("join",`order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes("admin")){
    socket.emit("join","adminRoom")
}

socket.on("orderUpdated",(data)=>{
    const updatedOrder = {...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)

    new Noty({

        type: "information",
        timeout: 1000,
        progressBar: false,
        layout: "topRight", // 1 second
        text: "Your Status Updated !!"
        
      }).show();
})

