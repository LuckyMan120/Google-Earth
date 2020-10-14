export default [
    {
        path: '/home',
        name: 'Home',
        component: () => import('../views/Home'),
        meta: {
            actionbar: {
                header: {
                    title: 'Map Home'
                }
            }
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register'),
        meta: {
            actionbar: {
                header: {
                    title: 'Registration'
                }
            }
        }
    },
    {
        path: '/reset-password',
        name: 'PasswordReset',
        component: () => import('../views/PasswordReset'),
        meta: {
            actionbar: {
                header: {
                    title: 'Reset Password'
                }
            }
        }
    },
    {
        path: '/*',
        redirect: '/home'
    }
]