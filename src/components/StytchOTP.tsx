import { useState } from 'react';
import { useStytch, useStytchSession, useStytchUser } from '@stytch/react';

type OtpStep = 'submit' | 'verify';

/**
 * One-time passcodes can be sent via phone number through Stytch
 */
const StytchOTP = () => {
  const { user } = useStytchUser();

  const [step, setStep] = useState<OtpStep>('submit');
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
      setStep('verify');
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

      /*if (user) {
        alert("Welcome, "+ user.name);
      }*/

    } catch (err: any) {
      alert("Invalid code entered");
      setError(err);
    } finally {
      setLoading(false);
    }
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
          <h1>Enter your email</h1>
          <p>A verification code will be sent to your email.</p>
          <div className="form-wrapper">
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
                onClick={() => setStep("submit")}
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
          <h1>Check your email</h1>
          <p>Enter the 6-digit verification code to {userId}</p>
          <div className="form-wrapper">
            <form className="form" onSubmit={authenticate}>
              <label htmlFor="code" className="sr-only">
                Code
              </label>
              <input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                type="code"
                name="code"
                className="form__input"
                placeholder="Verification code"
                autoComplete="off"
              ></input>
              <button type="submit" className="btn btn--primary">
                Verify
              </button>
              <button
                onClick={() => setStep('submit')}
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