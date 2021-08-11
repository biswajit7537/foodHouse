
const Menu = require("../../models/menu");
function homeController() {
    return {
        async index(req, res) {

            const items = await Menu.find();
           // console.log(items);
            return res.render('home', { allItems: items });

            // Menu.find().then(function(items){
            //     console.log(items);

            //     res.render('home',{allItems : items});

        }
    }
}

module.exports = homeController;