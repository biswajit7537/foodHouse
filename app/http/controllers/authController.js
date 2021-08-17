const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
    const _getRedirectUrl = (req)=>{
        return req.user.role === "admin" ? "/admin/orders" : "/customer/orders"
    }
    return {
        login(req, res) {

            res.render('auth/login');

        },
        postLogin(req, res, next) {
            const { email, password } = req.body;
            //request validation
            if(!email && !password){
                req.flash("error", "All fields are required");
                return res.redirect("/login");
            }
            if (!email) {
                req.flash("error", "Username can not be empty");
                return res.redirect("/login");
            }
            if(!password){
                req.flash("error", "Password can not be empty");
                req.flash("email", email);
                return res.redirect("/login");
            }
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    req.flash("error", info.message)
                    return next(err);
                }
                if (!user) {
                    req.flash("error", info.message)
                    return res.redirect("/login");
                }

                req.login(user, (err) => {
                    if(err){
                        req.flash("error", info.message)
                        return next(err);
                    }
                    return res.redirect(_getRedirectUrl(req));
                    
                })
            })(req,res,next)
        },
        register(req, res) {

            res.render('auth/register');

        },
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            //request validation

            if (!name || !email || !password) {
                req.flash("error", "All fields are required");
                req.flash("name", name);
                req.flash("email", email);
                return res.redirect("/register");
            }
            // console.log(req.body);

            // check if the email is exist or not
            User.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash("error", "This Email already exist");
                    req.flash("name", name);
                    req.flash("email", email);
                    return res.redirect("/register");
                }
            });

            // hash password

            const hashedPassword = await bcrypt.hash(password, 10);

            // create a User

            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            })
            user.save().then((user) => {
                return res.redirect("/");

            }).catch(err => {
                req.flash("error", "Something Went Wrong");
                return res.redirect("/register");
            })
        },

        logout(req,res){
            req.logout()
            return res.redirect("/login");
        }
    }
}

module.exports = authController;