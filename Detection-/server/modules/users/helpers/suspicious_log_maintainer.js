
const httpStatus = require("http-status");
const dbHelper = require("./../../../helper/mysql");
const { v4 } = require("uuid");
module.exports = {
    setLog: async(payload) => {
        let response = {status: httpStatus.BAD_REQUEST, message: "Validation Failed"};
        try {
            let customerLog =
            {   
                uuid:v4(),
                function_name:payload.functionName,
                postive_suspicious_mark:payload.positiveMark,
                negative_suspicious_mark:payload.negativeMark,
                mobile_number:payload.mobileNumber,
                ultimate_value:100,
                created_date:new Date().getTime(),
                update_date:null
            }



 let logCustomer = await dbHelper.format(`INSERT into Detection.Detection_log_customer set ? `, [customerLog])
 let [logCustomerResult] =await dbHelper.query(logCustomer);
 if(logCustomerResult && logCustomerResult.affectedRows>0)
    {
        return response = {status: httpStatus.OK, message: "success"};
    }
        
       
        } catch (err) {
            throw err;
        }
    }
};

