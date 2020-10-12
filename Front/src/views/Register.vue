<template>
    <div class="register-body">
        <div class="login-body">
            <div class="col-7 left-body">
                <h3>WHAT WILL YOU PERFORM TODAY?</h3>
                <span>Let's get started</span>
            </div>

            <!-- main login and register section -->
            <div class="col-5 right-body">
                <div v-if="!success" class="lg-non-success md-non-success non-success">
                    <!-- image section -->
                    <div class="img-pin" v-if="title === 'Sign Up'">
                    </div>
                    <div @click="uploadFile" class="img-profile" :style="{'background-image': 'url(' + image + ')'}" v-if="title === 'Sign In'">
                        <div class="camera-icon">
                            <v-icon icon="camera" class="v-icon-camera" /><br>
                            <span>Upload</span>
                        </div>
                    </div>

                    <!-- switch section -->
                    <div class="switch-section">
                        <span>{{ subTitle }}</span>
                        <a @click="switchBtn">{{ title }}</a>
                    </div>

                    <!-- email -->
                    <div class="input-card">
                        <v-icon icon="envelope" class="v-icon" />
                        <input type="text" v-model="email" placeholder="Enter your email">
                    </div>
                    <span class="error" v-if="emailError.state"> {{emailError.message}} </span>
                    
                    <!-- password -->
                    <div class="input-card">
                        <v-icon icon="lock" class="v-icon" />
                        <input :type="passwordTextType" v-model="password" placeholder="Enter your password">
                        <v-icon :icon="passwordEye" @click="showPassword('password')" class="v-icon-eye" />
                    </div>
                    <span class="error" v-if="passwordError.state"> {{passwordError.message}} </span>

                    <!-- password confirm -->
                    <div class="input-card" v-if="title === 'Sign In'">
                        <v-icon icon="lock" class="v-icon" />
                        <input :type="confirmTextType" v-model="confirm" placeholder="Enter comfirm password">
                        <v-icon :icon="confirmEye" @click="showPassword('confirm')" class="v-icon-eye" />
                    </div>
                    <span class="error" v-if="confirmError.state"> {{confirmError.message}} </span>
                    
                    <button @click="toggle">
                        {{ btnValue }}
                        <Spinner v-if="loading" class="loading" />
                    </button>
                </div>

                <!-- verification link sent -->
                <div v-else class="verification-field lg-verification-field md-verification-field">
                    <img :src="emailImage" class="email-image">
                    <span>Just sent verification link to your email. Please check your mail box...</span>
                </div>
            </div>

            <UploadFile :name="'profile'" @change="onPhotoChange" ref="file"></UploadFile>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import firebase from 'firebase';
import dialogs from '../services/dialogs.js'
import Spinner from '../components/Spinner'
import emailImg from '../assets/email.jpg'
import UploadFile from '../components/UploadFile'
import pinImg from '../assets/pin.jpg'

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
            confirm: '',
            emailError: new Error(),
            confirmError: new Error(),
            passwordError: new Error(),
            title: 'Sign Up',
            subTitle: 'Need an Account?',
            btnValue: 'Sign In',
            loading: false,
            success: false,
            emailImage: emailImg,
            passwordEye: 'eye',
            confirmEye: 'eye',
            passwordTextType: 'password',
            confirmTextType: 'password',
            image: ''
        }
    },
    components: {
        Spinner,
        UploadFile
    },
    mounted () {
        if (Object.keys(this.$route.query).length !== 0) {
            this.loading = true
            const auth = firebase.auth()
            const oobCode = this.$route.query.oobCode
            const vm = this
            auth.checkActionCode(oobCode)
                .then(result => {
                    vm.autoLogin({ email: result.data.email }).
                        then(() => {
                            vm.loading = false
                            this.$router.push({ name: 'Home' })
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))

        }
        this.pinImg = pinImg
    },
    computed: {
        ...mapGetters({
            errMsg: 'auth/getErrMsg',
            auth: 'auth/checkLogin'
        })
    },
    methods: {
        ...mapActions({
            doLogin: 'auth/login',
            autoLogin: 'auth/autoLogin',
            doRegister: 'auth/register',
            updatePhoto: 'auth/updatePhoto'
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

            // check the confirm field in sign up case
            if (this.title === 'Sign In') {
                if (this.confirm.length < 1) {
                    this.confirmError.state = true;
                    this.confirmError.message = 'You must insert the confirm password.';
                    globalError = true;
                } else if (this.confirm.length < 8) {
                    this.confirmError.state = true;
                    this.confirmError.message = 'Your confirm password must be at least 8 characters.';
                    globalError = true;
                } else if (this.password !== this.confirm) {
                    this.confirmError.state = true;
                    this.confirmError.message = 'Does not match passwords'
                    globalError = true;
                }
            }

            return globalError;
        },
        showPassword: function (type) {
            if (type === 'password') {
                if (this.passwordEye === 'eye') {
                    this.passwordEye = 'eye-slash'
                    this.passwordTextType = 'text'
                } else {
                    this.passwordEye = 'eye'
                    this.passwordTextType = 'password'
                }
            } else {
                if (this.confirmEye === 'eye') {
                    this.confirmEye = 'eye-slash'
                    this.confirmTextType = 'text'
                } else {
                    this.confirmEye = 'eye'
                    this.confirmTextType = 'password'
                }
            }
        },
        switchBtn: function () {
            if (this.title === 'Sign Up') {
                this.title = 'Sign In'
                this.subTitle = 'Already have an Account?'
                this.btnValue = 'Sign Up'
            } else {
                this.title = 'Sign Up'
                this.subTitle = 'Need an Account?'
                this.btnValue = 'Sign In'
            }
            this.emailError.state = false
            this.passwordError.state = false
            this.confirmError.state = false
        },
        onPhotoChange: function (data) {
            this.image = data.profile
        },
        toggle: function () {
            if (this.validate()) {
                dialogs.message('You must correct or complete some fields to complete your registration.', { duration: 10, state: 'error' });
                return;
            }
            this.loading = true
            if (this.btnValue === 'Sign In') {
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
            } else {

                const email = this.email
                const password = this.password
                const auth = firebase.auth()
                const vm = this
                auth.createUserWithEmailAndPassword(email, password)
                    .then(result => {
                        console.log(result)
                        auth.onAuthStateChanged(firebaseUser => {
                            console.log('firebaseUser', firebaseUser)
                            if (firebaseUser) {
                                firebaseUser.sendEmailVerification().then(fireResult => {
                                    console.log('fireResult', fireResult)

                                    let registerData = {
                                        email: vm.email,
                                        password: vm.password,
                                        imageInfo: vm.image
                                    }
                                    vm.doRegister(registerData)
                                        .then(success => {
                                            console.log(success)
                                            vm.loading = false
                                            vm.success = true
                                            dialogs.message('Just sent verification link to your email', { duration: 10, state: 'success' });
                                        })
                                        .catch(err => {
                                            console.log(err)
                                        })
                                }, function (error) {
                                    console.log(error)
                                    window.alert('not send Verification');
                                });
                            } else {
                                console.log('not logged in');
                            }
                        });
                    })
                    .catch(() => {
                        dialogs.message('User already exists. Please try again', { duration: 10, state: 'error' });
                        return;
                    });
            }
        }
    },
    watch: {
        email: function () {
            this.emailError.state = false
        },
        password: function () {
            this.passwordError.state = false
        },
        confirm: function () {
            this.confirmError.state = false
        }
    }
}
</script>