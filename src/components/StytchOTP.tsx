import { FC, useState } from 'react';
import { useStytch, useStytchSession, useStytchUser } from '@stytch/react';
import OtpInput from 'react-otp-input';

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
          <p>A verification code will be sent to your email.</p>
          <div className="form-wrapper" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <form className="form" onSubmit={sendPasscode}>
              <input
                id='email'
                value={userId}
                onChange={e => setUserId(e.target.value)}
                type='email'
                name='email'
                className="form__input"
                placeholder='Your email'
                autoComplete="off"
              ></input>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                Send code
              </button>
              <button
                onClick={onMoveBack}
                className="btn btn--link"
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
          <p style={{display: "flex", justifyContent: "center", alignItems: "center"}}>Enter the 6-digit verification code to {userId}</p>
          <div className="form-wrapper" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <form className="form" onSubmit={authenticate}>
              <label htmlFor="code" className="sr-only">
                Code
              </label>
              <OtpInput
                value={code}
                onChange={setCode}
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
              />
              <button type="submit" className="btn btn--primary">
                Verify
              </button>
              <button
                onClick={onTryAgainClick}
                className="btn btn--outline"
              >
                Try again
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default StytchOTP;