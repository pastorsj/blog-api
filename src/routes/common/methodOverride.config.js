/* eslint-disable */
import methodOverride from 'method-override';

function useMethodOverride(request) {
    methodOverride((req) => {
        const method = req.body._method;
        if (req.body && typeof req.body.toString() === 'object' && '_method' in req.body) {
            delete req.body._method;
        }
        return method;
    }).call(null, request);
}

export default useMethodOverride;
