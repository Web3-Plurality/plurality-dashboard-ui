import { FC, useState } from 'react';
import { useStytch, useStytchSession, useStytchUser } from '@stytch/react';
import OtpInput from 'react-otp-input';
import './otpCss.css'
import axios from 'axios';
import { useFormik } from 'formik';
import Input from './bootstrap/forms/Input';
import FormGroup from './bootstrap/forms/FormGroup';
import Button from './bootstrap/Button';
import validate from '../pages/presentation/demo-pages/helper/editPagesValidate';
import classNames from 'classnames';

interface ILoginProps {
	moveBack: any;
  sendCode: any;
  tryAgain: any;
  showSuccess: any;
  step: string;
  address: any;
}

/**
 * One-time passcodes can be sent via phone number through Stytch
 */
const StytchOTP: FC<ILoginProps> = ({ moveBack, sendCode, tryAgain, showSuccess, step, address }) => {
  const { user } = useStytchUser();
  const [methodId, setMethodId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const stytchClient = useStytch();

  const formik = useFormik({
		initialValues: {
			firstName: '',
			lastName: '',
			displayName: '',
			emailAddress: '',
			phone: '',
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate,
		onSubmit: () => {
		},
	});

  async function sendPasscode(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      let response = await stytchClient.otps.email.loginOrCreate(formik.values.emailAddress);
      console.log(response);
      setMethodId(response.method_id);
      sendCode();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function authenticate(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await stytchClient.otps.authenticate(code, methodId, {
        session_duration_minutes: 60,
      });
      console.log(response);
      if (response.status_code == 200 && response.session_jwt) {
        registerInBackend({email: response?.user?.emails[0].email, address: address});
      }
    } catch (err: any) {
      alert("Invalid code entered");
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const onMoveBack = () => {
    moveBack();
  }

  const onTryAgainClick = () => {
    setCode('')
    tryAgain();
  }

  const registerInBackend = (requestBody: any) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL + '/stytch'
    axios.post(apiUrl, {
      data: requestBody
    })
    .then(function (response) {
      if(response.status === 200) {
        showSuccess();
      } 
    })
    .catch(function (error) {
      alert("Something goes wrong, please try again!")
    })
  }

  return (
    <>
      {step === 'submit' && (
        <>
          {error && (
            <div className="alert alert--error">
              <p>{error.message}</p>
            </div>
          )}
          <div className="form-wrapper mt-5" style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "50px", marginLeft:"20px", marginRight:"20px"}}>
            <form className="form" onSubmit={sendPasscode} style={{width: "100%"}}>
            <FormGroup
                id='emailAddress'
                label='Email address'
                isFloating>
                <Input
                  type='email'
                  placeholder='Email address'
                  autoComplete='email'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.emailAddress}
                  isValid={formik.isValid}
                  isTouched={formik.touched.emailAddress}
                  invalidFeedback={formik.errors.emailAddress}
                  validFeedback='Looks good!'
                />
            </FormGroup>
              <br />
              <Button
								isOutline
                className="border-light"
								color={'dark'}
                style={{ height: "50px", width: "140px", marginTop: "5px" }}
                onClick={onMoveBack}>
                Back
              </Button>
              <Button
								isOutline
                isDisable={!!formik.errors.emailAddress || !formik.values.emailAddress}
                className="border-light"
								color={'success'}
                style={{ marginLeft:"60px", height: "50px",  width: "140px", marginTop: "5px" }}
                onClick={sendPasscode}>
                Send code
              </Button>
            </form>
          </div>
        </>
      )}
      {step === 'verify' && (
        <>
          <div className="form-wrapper" style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "50px"}}>
            <form className="form" onSubmit={authenticate}>
              <div style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "10px"}}>
                <OtpInput
                  value={code}
                  onChange={setCode}
                  numInputs={6}
                  inputStyle={'customInputStyle'}
                  renderSeparator={<span></span>}
                  renderInput={(props) => <input {...props} 
                  />}
                />
              </div>

                <Button
                  isOutline
                  color={'success'}
                  className={classNames('w-100 py-3', {
                    'border-light': true
                  })}
                  onClick={authenticate}>
                  verify
                </Button>
                <div className='d-flex align-items-center justify-content-center' style={{marginTop: "5px"}}>
                  <a href="#" className="hyperlink-button" onClick={onTryAgainClick}>
                    Didn’t get the code? Try again
                  </a>
                </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default StytchOTP;