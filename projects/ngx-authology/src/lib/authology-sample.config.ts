
export const AuthologyConfig = {
    // This determines whether at the time of login, all brands have to be logged in or not.
    // Optional. Boolean.
    login_all: false,

    // Required.
    routes: {
        // Example of routes written with direct keys
        login: '/login', // This is only required when the portal has it's own login page.
        default_auth: '/',
        
        // This is used for external login system.
        redirect: true,

        // OR

        // Example of routes written as key/value
        rep: {
            login: '/login',
            default_auth: '/',
            redirect: true,
        },
        hos: {
            login: '/login',
            default_auth: '/',
            redirect: true,
        }
    },
    cookieAuth: {
        // Example of cookie written with direct keys
        name: 'TOKEN_NAME',
        expires: 30,
        path: '/',
        passport_login: {
            path: 'login',
            scope: 'admin'
        },


        // OR

        // Example of cookie written as key/value
        rep: {
            name: 'TOKEN_NAME',
            expires: 30,
            path: '/',
            passport_login: {
                path: 'login',
                scope: 'admin'
            }
        },
        hos: {
            name: 'TOKEN_NAME',
            expires: 30,
            path: '/',
            passport_login: {
                path: 'login',
                scope: 'admin'
            }
        }
    },
    cookieRememberMe: {
        name: 'rememberMe',
        expires: 30,

        // OR

        // Example of cookie written as key/value

        rep: {
            name: 'rememberMeRep',
            expires: 30,
        },
        hos: {
            name: 'rememberMeHos',
            expires: 30,
        }
    }
}
