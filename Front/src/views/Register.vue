<template>
    <div class="register-body">
        <!-- back button -->
        <mdbBtn color="info" class="back-home" @click="back">
            <v-icon icon="home" class="v-icon-back" />
            Back Home
        </mdbBtn>

        <div v-if="!forgetFlag" class="login-body">
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
                
                <!-- password reset -->
                <!-- <a class="forget-a" @click="forgetPassword(true)">
                    Forget password?
                </a> -->

                <mdbBtn color="success" class="login-btn" @click="login">
                    <span>Log In</span>
                    <Spinner v-if="loading" class="loading" />
                </mdbBtn>
            </form>
        </div>

        <!-- password forget field -->
        <dir v-else class="login-body" style="padding: unset;">
            <form v-if="!linkFlag" class="login-form-section">
                <p class="h4 text-center mb-4">Forget password</p>
                
                <!-- email -->
                <div class="input-card-section">
                    <v-icon icon="envelope" class="v-icon-item" />
                    <mdb-input label="Your email" type="text" v-model="resetEmail" />
                </div>
                <span class="error" v-if="resetEmailError.state"> {{resetEmailError.message}} </span>

                <!-- back btn -->
                <a class="forget-a" @click="forgetPassword(false)">
                    Back
                </a>
                <mdbBtn color="success" class="login-btn" @click="sendLink">
                    <span>Send link</span>
                    <Spinner v-if="loading" class="loading" />
                </mdbBtn>
            </form>

            <!-- reset link sent -->
            <form v-else class="reset-form">
                <img :src="emailImage" class="email-image">
                <span>Just sent password reset link to your email. Please check your mail box...</span>
            </form>
        </dir>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mdbInput, mdbBtn } from 'mdbvue';
import firebase from 'firebase'
import dialogs from '../services/dialogs.js'
import Spinner from '../components/Spinner'
import emailImg from '../assets/email.jpg'

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
            resetEmailError: new Error(),
            loading: false,
            passwordEye: 'eye',
            passwordTextType: 'password',
            forgetFlag: false,
            resetEmail: '',
            emailImage: emailImg,
            linkFlag: false
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
            auth: 'auth/checkLogin',
            checkFlag: 'auth/getcheckFlag'
        })
    },
    methods: {
        ...mapActions({
            doLogin: 'auth/login',
            checkUser: 'auth/checkUser',
            saveResetEmail: 'auth/saveResetEmail'
        }),
        uploadFile: function () {
            this.$refs.file.show();
        },
        validate: function () {
            let globalError = false
            if (this.forgetFlag) {
                if (this.resetEmail === '') {
                    this.resetEmailError.state = true
                    this.resetEmailError.message = 'You have to insert the email!'
                    globalError = true
                } else if (!emailRegex.test(this.resetEmail)) {
                    this.resetEmailError.state = true
                    this.resetEmailError.message = 'You have to insert validated email!'
                    globalError = true
                }
            } else {
                if (this.email === '') {
                    this.emailError.state = true
                    this.emailError.message = 'You have to insert the email!'
                    globalError = true
                } else if (!emailRegex.test(this.email)) {
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
        },
        forgetPassword: function (flag) {
            this.forgetFlag = flag
        },
        sendLink: function () {
            if (this.validate()) {
                dialogs.message('You must insert your existing email to reset your password.', { duration: 10, state: 'error' });
                return;
            }
            this.loading = true

            this.checkUser({ email: this.resetEmail })
                .then(() => {
                    
                    if (this.checkFlag) {
                        const vm = this
                        const auth = firebase.auth()
                        auth.sendPasswordResetEmail(this.resetEmail)
                            .then(() => {
                                vm.saveResetEmail(vm.resetEmail)
                                vm.loading = false
                                vm.linkFlag = true

                                dialogs.message('Just sent password reset link to your email. Please check your mail box!', { duration: 10, state: 'success' });
                            })
                            .catch(err => console.log(err))
                    } else {
                        this.resetEmailError.message = 'Wrong email';
                        this.resetEmailError.state = true
                        
                        dialogs.message('Wrong email.', { duration: 10, state: 'error' });
                        this.loading = false
                    }
                })
                .catch(err => console.log(err))
        }
    },
    watch: {
        email: function () {
            this.emailError.state = false
        },
        password: function () {
            this.passwordError.state = false
        },
        resetEmail: function () {
            this.resetEmailError.state = false
        }
    }
}
</script>