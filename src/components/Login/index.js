import {Component} from 'react';
import Cookies from 'js-cookie';
import {useNavigate, Navigate} from 'react-router-dom';

import './index.css'

class Login extends Component {
    state = {
        Email: "",
        password: "",
        showSubmitError: false,
        errorMsg: ""
    }
    onEmailChange = event =>{
        this.setState({Email: event.target.value})
    }
    onPasswordChange = event =>{
        this.setState({password: event.target.value})
    }

    onSubmitSuccess = jwtToken => {
        const {history, navigate} = this.props
        Cookies.set("jwt_token", jwtToken, {
            expires : 30,
          
        })
        if (navigate) {
            navigate('/home', {replace: true})
        } else if (history && history.replace) {
            history.replace('/home')
        } else {
            window.location.replace('/home')
        }
        console.log("success")
        
    }
    onSubmitFailure = errorMsg => {
        console.log(errorMsg)
        this.setState({showSubmitError: true, errorMsg})
    }

    onSubmitForm = async event => {
        event.preventDefault()
        const {Email, password} = this.state 
        const userDetails = {email: Email, password}
        const url = "https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin"
        const options = {
            method : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(userDetails)
        }
        try {
            const response = await fetch(url, options)
            const data = await response.json()
            

            // Try common token field names the API might return
            const possibleFields = ['token', 'jwt', 'accessToken', 'access_token', 'authToken', 'idToken']
            let token = undefined
            let tokenField = undefined

            if (data && typeof data === 'object') {
                for (const f of possibleFields) {
                    if (Object.prototype.hasOwnProperty.call(data, f) && data[f]) {
                        token = data[f]
                        tokenField = f
                        break
                    }
                }
                // check nested `data` object: { data: { token: '...' } }
                if (!token && data.data && typeof data.data === 'object') {
                    for (const f of possibleFields) {
                        if (Object.prototype.hasOwnProperty.call(data.data, f) && data.data[f]) {
                            token = data.data[f]
                            tokenField = `data.${f}`
                            break
                        }
                    }
                }
            }

            console.log('signin response', response.status, response.ok, 'tokenField=', tokenField, 'tokenPresent=', !!token, data)

            if (response.ok) {
                if (token) {
                    this.onSubmitSuccess(token)
                } else {
                    this.onSubmitFailure('No token field found in response')
                }
            } else {
                this.onSubmitFailure(data && data.message ? data.message : JSON.stringify(data))
            }
        } catch (error) {
            console.error('signin error', error)
            this.onSubmitFailure(error.message)
        }

    }


    renderUsernameField = () => {
        const {Email} = this.state
        return(
            <>
                <label className='input-label' htmlFor="Email">
                    Email
                </label>
                <input 
                    type="text"
                    placeholder="you@example.com"
                    id="Email"
                    className='input-field'
                    value={Email}
                    onChange={this.onEmailChange}
                />
            </>
        )
    }
    renderPasswordField = () => {
        const {password} = this.state 
        return(
            <>
                <label className='input-label' htmlFor="password">
                    Password
                </label>
                <input 
                    type="password"
                    id="password" 
                    placeholder='........'
                    className='input-field'
                    value={password}
                    onChange={this.onPasswordChange}
                />
            </>
        )
    }
    render(){
        const {showSubmitError, errorMsg,Email,password} = this.state
        
        const jwtToken = Cookies.get("jwt_token")
        console.log(jwtToken)
        if(jwtToken !== undefined){
            return <Navigate to="/home" />
        }
        return(
            
            
            <div className="login-conteiner">
             
            <form className="form-container" onSubmit={this.onSubmitForm}>
                <h1 className='main-heading-form'>
                    Go Business
                </h1>
                <p className='sub-heading-form'>
                    Sign in to open your referral dashboard
                </p>
                <div className='input-container' >
                    {this.renderUsernameField()}
                </div>
                <div className="input-container">
                    {this.renderPasswordField()}
                </div>
                <button type="submit" className="login-button" >
                    Sign In
                </button>
                {showSubmitError && <p className="error-message">*{errorMsg}</p>}
            </form>
            </div>
        
        )
    }
}

function withRouter(Component){
    return function(props){
        const navigate = useNavigate()
        return <Component {...props} navigate={navigate} />
    }
}

export default withRouter(Login)