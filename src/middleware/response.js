const response = (statusCode, message, res) => {
    res.status(statusCode).json({
        payload: {
            status_code: statusCode,
            datas: data
        },
        message: message
    })
}

module.exports = response