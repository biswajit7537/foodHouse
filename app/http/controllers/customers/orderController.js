
const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    store(req, res) {
      const { phoneNumber, address, stripeToken, paymentType } = req.body

      if (!phoneNumber || !address) {

        return res.status(422).json({ message: "All fields are require" })
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone: phoneNumber,
        address: address
      })

      order.save().then(result => {

        Order.populate(result, { path: "customerId" }, (err, placedOrder) => {

          if (paymentType === "card") {

            stripe.charges.create({
              amount: req.session.cart.totalPrice * 100,
              source: stripeToken,
              currency: 'inr',
              description: `Order Id : ${placedOrder._id}`
            }).then(() => {

              placedOrder.paymentStatus = true;
              placedOrder.paymentType = paymentType;
              placedOrder.save().then((ord) => {

                // emit
                const eventEmitter = req.app.get("eventEmitter")
                eventEmitter.emit('orderPlaced', ord)
                delete req.session.cart;
                return res.json({ message: "Payment Successful, Order Placed Successfully" });

              }).catch((err) => {
                
                return res.json({ message: "Something went wrong !! , pay at delivery time" });
                
              })

            }).catch((err) => {
              delete req.session.cart;
              return res.json({ message: "Payment Failed But your order placed successfully, You can pay at delivery time." })
            })

          }else{
            delete req.session.cart;  
            return res.json({message : "Order Placed Successfully"});
          }

        })



      }).catch(err => {
        return res.status(500).json({message : "Something went wrong !!"})
      })
    },

    async index(req, res) {

      const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } })  // -1 is for sorting in decending order

      res.header('Cache-Control', 'no-cache,private,no-store,must-revalidate,max-stale=0, post-check=0,pre-check=0')

      res.render("customers/orders", { orders: orders, moment: moment });

    },

    async show(req, res) {
      const order = await Order.findById(req.params.id)
      // authorize user
      if (req.user._id.toString() === order.customerId.toString()) {

        return res.render("customers/singleOrder", { order: order })

      } else {
        return res.redirect("/");
      }
    }
  }
}

module.exports = orderController;