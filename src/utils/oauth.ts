// VERIFIER API Twitter OAuth GET CALL
// /oauth-twitter/ -> fetch twitter id token after oauth
export const getTwitterID = async (isWidget: String, origin: String) => {
    window.location.replace(process.env.REACT_APP_API_BASE_URL+`/oauth-twitter?isWidget=${isWidget}&origin=${origin}`);
}