import { FC, useState } from 'react';
import { useStytch, useStytchSession, useStytchUser } from '@stytch/react';
import OtpInput from 'react-otp-input';
import './otpCss.css'

interface ILoginProps {
	moveBack: any;
  sendCode: any;
  tryAgain: any;
  step: string;
}

/**
 * One-time passcodes can be sent via phone number through Stytch
 */
const StytchOTP: FC<ILoginProps> = ({ moveBack, sendCode, tryAgain, step }) => {
  const { user } = useStytchUser();
  const [userId, setUserId] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const stytchClient = useStytch();

  async function sendPasscode(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      let response = await stytchClient.otps.email.loginOrCreate(userId);
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
        alert("Login successful for user with email: " + user?.emails[0].email + ". TODO: save it to your backend database");
        console.log(user);
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
    tryAgain();
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
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <h1>Enter your email</h1>
          </div>
          <div className="d-flex align-items-center mt-5 mx-5">
            <p>A verification code will be sent to your email.</p>
          </div>
          <div className="form-wrapper" style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "10px", marginLeft:"20px"}}>
            <form className="form" onSubmit={sendPasscode} style={{width: "80%"}}>
              <input
                id='email'
                value={userId}
                onChange={e => setUserId(e.target.value)}
                type='email'
                name='email'
                className="form__input mb-4"
                placeholder='Your email'
                autoComplete="off"
                style={{width: "90%"}}
              ></input>
              <br />
              <button
                type="submit"
                className="btn btn--primary btn-outline-custom px-4"
                disabled={loading}
              >
                Send code
              </button>
              <button
                onClick={onMoveBack}
                className="btn btn--link btn-outline-custom px-5"
                style={{marginLeft: "50px"}}
              >
                Back
              </button>
            </form>
          </div>
        </>
      )}
      {step === 'verify' && (
        <>
          <h1 style={{display: "flex", justifyContent: "center", alignItems: "center"}}>Check your email</h1>
          <div className="d-flex align-items-center mt-5 mx-5">
            <p className="text-center">Enter the 6-digit verification code to {userId}</p>
          </div>
          <div className="form-wrapper" style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "10px"}}>
            <form className="form" onSubmit={authenticate}>
              <div style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "30px", marginTop: "10px"}}>
                <OtpInput
                  value={code}
                  onChange={setCode}
                  numInputs={6}
                  inputStyle={'customInputStyle'}
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} 
                  />}
                />
              </div>
              <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <button type="submit" className="btn btn--primary btn-outline-custom px-4">
                  Verify
                </button>
                <button
                  onClick={onTryAgainClick}
                  style={{marginLeft: "80px"}}
                  className="btn btn--link btn-outline-custom px-3"
                >
                  Try again
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default StytchOTP;