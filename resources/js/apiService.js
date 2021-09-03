import axios from "axios";
import Noty from "noty";

export function placeOrder(formObject){

    axios.post("/orders", formObject).then((res) => {

        new Noty({

            type: "success",
            timeout: 1000,
            progressBar: false,
            layout: "topCenter", // 1 second
            text: res.data.message

        }).show();

        setTimeout(() => {

            window.location.href = "/customer/orders";

        }, 1000);



    }).catch((error) => {
        new Noty({

            type: "success",
            timeout: 1000,
            progressBar: false,
            layout: "topCenter", // 1 second
            text: error.res.data.message

        }).show();
    })


}

