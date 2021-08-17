import axios from "axios";
import Noty from "noty";
import {initAdmin} from './admin';

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

initAdmin()