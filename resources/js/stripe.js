

import { loadStripe } from '@stripe/stripe-js';
import {placeOrder} from "./apiService";

export async function initStripe() {


    const stripe = await loadStripe('pk_test_51JTUjkSH4dJ4DklrsaDaAqKRogu7VOgQgfbpc3mXw7EHLCiMLMtoGrF3RBSOfqOGK0Qpj2OHpdIgJAZAGgrfQxsd00SUVgz8i9');
    
    let card = null;
    function mountWidget() {

        const stripeElements = stripe.elements()

        let style = {
            base: {
                color: "#32325d",
                fontFamily: "sans-serif",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }

            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        };

        card = stripeElements.create("card", { style, hidePostalCode: true })

        card.mount("#card-element")

    }



    const paymentType = document.querySelector("#paymentType")

    if(!paymentType){
        return;
    }

    paymentType.addEventListener("change", (e) => {

        if (e.target.value === "card") {
            // displaying card widget
            mountWidget();
        } else {

            card.destroy()

        }
    })

    // Ajax call

    const paymentForm = document.querySelector("#payment-form");
    if (paymentForm) {
        paymentForm.addEventListener("submit", (e) => {

            e.preventDefault()

            let formData = new FormData(paymentForm);
            let formObject = {}

            for (let [key, value] of formData.entries()) {

                formObject[key] = value
            }

            if(!card){

                placeOrder(formObject);
                return;
            }

            // verify card

            stripe.createToken(card).then((result)=>{

               formObject.stripeToken = result.token.id;
               placeOrder(formObject)

            }).catch((err)=>{
               
                console.log(err)
            })

           
        })
    }

}