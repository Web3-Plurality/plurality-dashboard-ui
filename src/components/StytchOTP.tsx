import { FC, useState, useContext } from 'react';
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
import LoadingContext from '../utils/LoadingContext';

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
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [subscribe, setSubscribe] = useState(true);
  const { showLoading, hideLoading } = useContext(LoadingContext);

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
    localStorage.setItem('email', formik.values.emailAddress)
    showLoading();
    try {
      let response = await stytchClient.otps.email.loginOrCreate(formik.values.emailAddress);
      console.log(response);
      setMethodId(response.method_id);
      sendCode();
    } catch (err: any) {
      alert("Something goes wrong while sending the passcode, please try it again");
    } finally {
      hideLoading();
    }
  }

  async function authenticate(event: any) {
    event.preventDefault();
    showLoading();
    try {
      const response = await stytchClient.otps.authenticate(code, methodId, {
        session_duration_minutes: 60,
      });
      console.log(response);
      if (response.status_code == 200 && response.session_jwt) {
        registerInBackend({ email: response?.user?.emails[0].email, address: address, subscribe: subscribe });
      }
    } catch (err: any) {
      alert("Invalid code entered, if this behavior persists, please contact us");
    } finally {
      hideLoading();
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
        if (response.status === 200) {
          showSuccess();
        }
      })
      .catch(function (error) {
        alert("Something goes wrong, please try again!")
      })
  }

  const handleAcceptTermsChange = () => {
    setAcceptTerms(!acceptTerms);
  };

  return (
    <>
      {step === 'submit' && (
        <>
          <div className="form-wrapper mt-5" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "-25px", marginLeft: "20px", marginRight: "20px" }}>
            <form className="form" onSubmit={sendPasscode} style={{ width: "100%" }}>
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
              <div style={{ marginTop: "-15px" }}>
                <label className="d-flex justify-content-left">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={handleAcceptTermsChange}
                    style={{ marginLeft: "5px" }}
                  />
                  <span style={{ marginLeft: '5px', fontSize: 'x-small' }}>I accept the <a href="https://plurality.network/user-terms-of-service" target="_blank" rel="noopener noreferrer">
                    terms of service
                  </a> and subscribe to receive updates from the DFDC</span>
                </label>
              </div>
              <br />
              <div className="d-flex justify-content-between">
                <Button
                  isOutline
                  className="border-light"
                  color={'dark'}
                  style={{ height: "50px", width: "140px" }}
                  onClick={onMoveBack}>
                  Back
                </Button>
                <Button
                  isOutline
                  isDisable={!!formik.errors.emailAddress || !formik.values.emailAddress || !acceptTerms}
                  className="border-light customized-button"
                  style={{ height: "50px", width: "140px" }}
                  onClick={sendPasscode}>
                  Send code
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
      {step === 'verify' && (
        <>
          <div className="form-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "50px" }}>
            <form className="form" onSubmit={authenticate}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", marginTop: "10px" }}>
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
              <div className='d-flex align-items-center justify-content-center' >
                <Button
                  isOutline
                  className={classNames('py-3', {
                    'border-light': true,
                    'customized-button': true
                  })}
                  style={{ width: "370px" }}
                  onClick={authenticate}>
                  Verify
                </Button>
              </div>
              <div className='d-flex align-items-center justify-content-center' style={{ marginTop: "5px" }}>
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