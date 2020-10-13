<template>
    <div class="register-body">
        <!-- back button -->
        <mdbBtn color="info" class="back-home" @click="back">
            Back Home
        </mdbBtn>

        <div class="login-body">
            <!-- Material form login -->
            <form class="login-form-section">
                <p class="h4 text-center mb-4">Sign in</p>

                <!-- email -->
                <div class="input-card-section">
                    <v-icon icon="envelope" class="v-icon-item" />
                    <mdb-input label="Your email" type="text" v-model="email" />
                </div>
                <span class="error" v-if="emailError.state"> {{emailError.message}} </span>
                
                <!-- password -->
                <div class="input-card-section">
                    <v-icon icon="lock" class="v-icon-item" />
                    <mdb-input label="Your password" :type="passwordTextType" v-model="password" />
                    <v-icon :icon="passwordEye" @click="showPassword" class="v-icon-eye" />
                </div>
                <span class="error" v-if="passwordError.state"> {{passwordError.message}} </span>
                
                <mdbBtn color="success" class="login-btn" @click="login">
                    <span>Log In</span>
                    <Spinner v-if="loading" class="loading" />
                </mdbBtn>
            </form>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mdbInput, mdbBtn } from 'mdbvue';
import dialogs from '../services/dialogs.js'
import Spinner from '../components/Spinner'

class Error {
    constructor (state = false, message = '') {
        this.state = false;
        console.log(state)
        this.message = '';
        console.log(message)
    }
}
let emailRegex = /^([A-Za-z0-9_\-.+])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,})$/

export default {
    name: 'Register',
    data () {
        return {
            email: '',
            password: '',
            emailError: new Error(),
            passwordError: new Error(),
            loading: false,
            passwordEye: 'eye',
            passwordTextType: 'password'
        }
    },
    components: {
        Spinner,
        mdbInput,
        mdbBtn
    },
    computed: {
        ...mapGetters({
            errMsg: 'auth/getErrMsg',
            auth: 'auth/checkLogin'
        })
    },
    methods: {
        ...mapActions({
            doLogin: 'auth/login'
        }),
        uploadFile: function () {
            this.$refs.file.show();
        },
        validate: function () {
            let globalError = false
            if (!emailRegex.test(this.email)) {
                this.emailError.state = true
                this.emailError.message = 'You have to insert validated email!'
                globalError = true
            }

            if (this.password.length < 1) {
                this.passwordError.state = true;
                this.passwordError.message = 'You must insert password.';
                globalError = true;
            } else if (this.password.length < 8) {
                this.passwordError.state = true;
                this.passwordError.message = 'Your password must be at least 8 characters.';
                globalError = true;
            }

            return globalError;
        },
        showPassword: function () {
            if (this.passwordEye === 'eye') {
                this.passwordEye = 'eye-slash'
                this.passwordTextType = 'text'
            } else {
                this.passwordEye = 'eye'
                this.passwordTextType = 'password'
            }
        },
        login: function () {
            if (this.validate()) {
                dialogs.message('You must correct or complete some fields to complete your registration.', { duration: 10, state: 'error' });
                return;
            }
            this.loading = true
            
            let loginData = {
                email: this.email,
                password: this.password
            }

            this.doLogin(loginData)
                .then(() => {
                    if (this.auth) {
                        this.loading = false
                        dialogs.message('Login success!', { duration: 10, state: 'success' });
                        this.$router.push({name: 'Home'})
                    } else {
                        this.loading = false
                        dialogs.message(this.errMsg, { duration: 10, state: 'error' });
                    }
                })
                .catch(err => console.log(err))
        },
        back: function () {
            this.$router.push({ name: 'Home' })
        }
    },
    watch: {
        email: function () {
            this.emailError.state = false
        },
        password: function () {
            this.passwordError.state = false
        }
    }
}
</script>