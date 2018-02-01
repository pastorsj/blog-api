const Response = {
    json: (res, status, content) => {
        res.status(status);
        res.json({
            data: content
        });
    },
    error: (res, status, content) => {
        res.status(status);
        res.json({
            error: content
        });
    },
    message: (res, status, content) => {
        res.status(status);
        res.json({
            message: content
        });
    }
};

export default Response;