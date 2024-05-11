"use strict";
(() => {
    const client = require('../client')

    exports.RegisterUser = async (request, res) => {

        try {

            client.RegisterUser(request.body,
                (err, data) => {
                    if (err) {
                        res.status(400).send(err)
                    }

                    else {

                        res.status(200).send(data)
                    }

                }

            )
        } catch (error) {
            res.send(`Error occured ${error}`)

        }
    };






})();