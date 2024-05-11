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

    exports.LoginUser = async (request, res) => {

        try {

            client.LoginUser(request.body,
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
    exports.ForgotPassword = async (request, res) => {

        try {

            client.ForgotPassword(request.body,
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

    exports.ResetDevice = async (request, res) => {

        try {

            client.ResetDevice(request.body,
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

    exports.getRiskDetails = async (request, res) => {

        try {

            client.getRiskDetails(request.body,
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