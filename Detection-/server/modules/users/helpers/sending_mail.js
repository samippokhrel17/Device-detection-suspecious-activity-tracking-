"use strict";
let nodemailer = require("nodemailer");
(sendingMail => {
sendingMail.send = async message => {
    try {

        const transporter = nodemailer.createTransport({
            host: "mail.myserver.com",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user:"balancehumanity49@gmail.com",
                pass: "mdgh lnzk hxpd htsw",
            },
        });
        await transporter.sendMail({
            to: message.email, //receiver email
            subject: message.subject, // Subject line
            text: message.details.message + ` ${message.details.value} `, // value is OTP
        });
    
        if (message.type == "OTP") {
            return {
                status: true,
                OTP: message.details.value,
            };
        }
    
        return {
            status: false,
            value: "UnsuccessFul",
        };
        
    } catch (error) {
       
        console.log("error from mail",error)
    }
   
};
})(module.exports);
