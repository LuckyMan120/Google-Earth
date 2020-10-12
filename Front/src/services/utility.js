export function getRoute (value, subRoute = '') {
    if (!subRoute) {
        subRoute = '';
    }

    if (value && value.length) {
        return process.env.ROUTE_BASE + subRoute + value;
    } else {
        return process.env.ROUTE_BASE + 'static/img/user.jpg';
    }
}