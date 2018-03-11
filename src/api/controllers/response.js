const Response = {
    json: (res, status, content) => {
        res.status(status);
        res.json({
            data: content
        });
    },
    error: (res, status, content) => {
        let errorMessage = content;
        if (content instanceof Error) {
            errorMessage = content.message;
        }
        res.status(status);
        res.json({
            error: errorMessage
        });
    },
    message: (res, status, content) => {
        res.status(status);
        res.json({
            message: content
        });
    },
    custom: (res, status, json) => {
        res.status(status);
        res.json(json);
    }
};

export default Response;
