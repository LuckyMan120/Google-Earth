<template>
    <div class="register-body">
        <div class="login-body">
            <!-- Material form login -->
            <form class="login-form-section">
                <p class="h4 text-center mb-4">Reset Password</p>

                <!-- password -->
                <div class="input-card-section">
                    <v-icon icon="lock" class="v-icon-item" />
                    <mdb-input label="New password" :type="passwordTextType" v-model="password" />
                    <v-icon :icon="passwordEye" @click="showPassword('password')" class="v-icon-eye" />
                </div>
                <span class="error" v-if="passwordError.state"> {{passwordError.message}} </span>

                <!-- confirm -->
                <div class="input-card-section">
                    <v-icon icon="lock" class="v-icon-item" />
                    <mdb-input label="Confirm password" :type="confirmTextType" v-model="confirm" />
                    <v-icon :icon="confirmEye" @click="showPassword('confirm')" class="v-icon-eye" />
                </div>
                <span class="error" v-if="confirmError.state"> {{confirmError.message}} </span>
                
                <mdbBtn color="success" class="login-btn" @click="reset">
                    <span>Reset pasword</span>
                    <Spinner v-if="loading" class="loading" />
                </mdbBtn>
            </form>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import dialogs from '../services/dialogs.js'
import { mdbInput, mdbBtn } from 'mdbvue';
import Spinner from '../components/Spinner'

class Error {
    constructor (state = false, message = '') {
        this.state = false;
        console.log(state)
        this.message = '';
        console.log(message)
    }
}

export default {
    name: 'PasswordReset',
    data () {
        return {
            password: '',
            confirm: '',
            passwordTextType: 'password',
            confirmTextType: 'password',
            passwordError: new Error(),
            confirmError: new Error(),
            passwordEye: 'eye',
            confirmEye: 'eye',
            loading: false,
            resetEmail: ''
        }
    },
    components: {
        Spinner,
        mdbInput,
        mdbBtn
    },
    computed: {
        ...mapGetters({
            getResetEmail: 'auth/getResetEmail'
        })
    },
    async mounted () {
        if (Object.keys(this.$route.query).length !== 0) {
            await this.getEmail()
            this.resetEmail = this.getResetEmail
        }
    },
    methods: {
        ...mapActions({
            getEmail: 'auth/getEmail',
            resetPassword: 'auth/resetPassword'
        }),
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
        reset: function () {
            if (this.validate()) {
                dialogs.message('You must correct or complete some fields to reset your password.', { duration: 10, state: 'error' });
                return;
            }

            this.loading = true

            this.resetPassword({ email: this.resetEmail, password: this.password })
                .then(() => {
                    this.loading = false
                    dialogs.message('Password reset completed successfully.', { duration: 10, state: 'success' });
                })
                .catch(err => console.log(err))
        },
        validate: function () {
            let globalError = false
            if (this.password.length < 1) {
                this.passwordError.state = true;
                this.passwordError.message = 'You must insert password.';
                globalError = true;
            } else if (this.password.length < 8) {
                this.passwordError.state = true;
                this.passwordError.message = 'Your password must be at least 8 characters.';
                globalError = true;
            }

            if (this.confirm.length < 1) {
                this.confirmError.state = true;
                this.confirmError.message = 'You must insert confirm password.';
                globalError = true;
            } else if (this.confirm.length < 8) {
                this.confirmError.state = true;
                this.confirmError.message = 'Your confirm password must be at least 8 characters.';
                globalError = true;
            } else if (this.password !== this.confirm) {
                this.confirmError.state = true
                this.confirmError.message = 'Does not match passwords'
                globalError = true
            }

            return globalError;
        }
    },
    watch: {
        password: function () {
            this.passwordError.state = false
        },
        confirm: function () {
            this.confirmError.state = false
        }
    }
}
</script>